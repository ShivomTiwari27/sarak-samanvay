import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

from backend.agent import run_graph_rag_query, get_db_driver, LLM_SERVICE

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI(title="SarakSamanvay API Server", version="1.0.0")

# Enable CORS for file:// access and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins (including local files)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class PermitCreate(BaseModel):
    agency: str
    roadId: str
    roadName: str
    startDate: str
    duration: int
    purpose: str

class CoordinateRequest(BaseModel):
    oppId: str
    permitId: str
    savings: float
    partner: str

class ChatQuery(BaseModel):
    query: str

@app.get("/api/status")
def get_status():
    driver = get_db_driver()
    db_connected = driver is not None
    if driver:
        driver.close()
        
    return {
        "status": "online",
        "database": "connected" if db_connected else "offline",
        "llm_service": LLM_SERVICE,
        "mode": "Live Cognitive Twin" if db_connected else "Local Mock Fallback"
    }

@app.get("/api/roads")
def get_roads():
    driver = get_db_driver()
    if not driver:
        # Fallback if DB offline
        raise HTTPException(status_code=503, detail="Neo4j Database is offline.")
        
    roads_list = []
    with driver.session() as session:
        result = session.run("MATCH (r:RoadSegment) RETURN r")
        for record in result:
            node = record["r"]
            # Parse coordinates string back to list
            try:
                coords = json.loads(node["coordinates"])
            except:
                coords = []
            
            roads_list.append({
                "id": node["id"],
                "name": node["name"],
                "status": node["status"],
                "lockinExpiry": node["lockinExpiry"] if node["lockinExpiry"] else None,
                "lockinDaysLeft": int(node["lockinDaysLeft"]) if node["lockinDaysLeft"] else 0,
                "coordinates": coords,
                "activePermits": []
            })
            
        # Find active permits for each road
        for r in roads_list:
            perm_result = session.run(
                "MATCH (p:DigPermit)-[:AFFECTS]->(road:RoadSegment {id: $roadId}) RETURN p.id as id",
                roadId=r["id"]
            )
            r["activePermits"] = [rec["id"] for rec in perm_result]
            
    driver.close()
    return roads_list

@app.get("/api/permits")
def get_permits():
    driver = get_db_driver()
    if not driver:
        raise HTTPException(status_code=503, detail="Neo4j Database is offline.")
        
    permits_list = []
    with driver.session() as session:
        result = session.run("MATCH (p:DigPermit) RETURN p")
        for record in result:
            node = record["p"]
            permits_list.append({
                "id": node["id"],
                "agency": node["agency"],
                "roadId": node["roadId"],
                "roadName": node["roadName"],
                "startDate": node["startDate"],
                "duration": int(node["duration"]),
                "purpose": node["purpose"],
                "cost": float(node["cost"]),
                "status": node["status"],
                "subscribers": list(node["subscribers"]) if node["subscribers"] else []
            })
    driver.close()
    return permits_list

@app.post("/api/permits")
def create_permit(permit: PermitCreate):
    driver = get_db_driver()
    if not driver:
        raise HTTPException(status_code=503, detail="Neo4j Database is offline.")
        
    with driver.session() as session:
        # 1. Validation Check: Is road under Lock-in period?
        road_result = session.run(
            "MATCH (r:RoadSegment {id: $roadId}) RETURN r.status as status, r.lockinExpiry as lockinExpiry",
            roadId=permit.roadId
        )
        road_record = road_result.single()
        if road_record and road_record["status"] == "lock-in":
            driver.close()
            raise HTTPException(
                status_code=400, 
                detail=f"Permit Denied: Target road is under PWD lock-in restriction until {road_record['lockinExpiry']}."
            )
            
        # 2. Insert Permit
        import random
        new_id = f"PM-{permit.agency[:3].upper()}-{random.randint(100, 999)}"
        cost = round(5.0 + random.random() * 8.0, 1)
        
        session.run(
            "CREATE (p:DigPermit {id: $id, agency: $agency, roadId: $roadId, roadName: $roadName, "
            "startDate: $startDate, duration: $duration, purpose: $purpose, cost: $cost, "
            "status: $status, subscribers: []})",
            id=new_id, agency=permit.agency, roadId=permit.roadId, roadName=permit.roadName,
            startDate=permit.startDate, duration=permit.duration, purpose=permit.purpose,
            cost=cost, status="Co-Digging Open"
        )
        
        # Link Permit to Road
        session.run(
            "MATCH (r:RoadSegment {id: $roadId}), (p:DigPermit {id: $id}) CREATE (p)-[:AFFECTS]->(r)",
            roadId=permit.roadId, id=new_id
        )
        
        # 3. Update Road Status to 'planned'
        session.run(
            "MATCH (r:RoadSegment {id: $roadId}) SET r.status = 'planned'",
            roadId=permit.roadId
        )
        
    driver.close()
    return {"message": "Permit created successfully", "permitId": new_id}

@app.get("/api/opportunities")
def get_opportunities():
    # Helper to calculate co-digging opportunities from live database entries
    driver = get_db_driver()
    if not driver:
        raise HTTPException(status_code=503, detail="Neo4j Database is offline.")
        
    opportunities = []
    with driver.session() as session:
        # Find roads that have a planned permit, check if BSNL or DISCOM needs to co-dig
        result = session.run(
            "MATCH (p:DigPermit)-[:AFFECTS]->(r:RoadSegment) "
            "WHERE p.status = 'Co-Digging Open' RETURN p, r"
        )
        
        for record in result:
            p = record["p"]
            r = record["r"]
            
            # Formulate mock partners
            partner = "Telecom (BSNL)" if p["agency"] != "BSNL" else "DISCOM"
            savings = round(p["cost"] * 0.4, 1)
            
            opportunities.append({
                "id": f"opp-{p['id']}",
                "targetRoad": r["id"],
                "roadName": r["name"],
                "leadAgency": p["agency"],
                "leadPermitId": p["id"],
                "proposedDates": f"{p['startDate']} (Duration {p['duration']} Days)",
                "potentialPartner": partner,
                "overlapReason": f"Potential overlap flagged: {partner} has pending service lines routing request in that segment zone.",
                "estimatedSavings": savings
            })
            
    driver.close()
    return opportunities

@app.post("/api/opportunities/coordinate")
def coordinate_opportunity(req: CoordinateRequest):
    driver = get_db_driver()
    if not driver:
        raise HTTPException(status_code=503, detail="Neo4j Database is offline.")
        
    with driver.session() as session:
        # Match permit and update subscribers and status
        session.run(
            "MATCH (p:DigPermit {id: $permitId}) "
            "SET p.subscribers = p.subscribers + [$partner], p.status = 'Co-Digging Synced'",
            permitId=req.permitId, partner=req.partner
        )
        
        # Get target road and change status to digging
        result = session.run(
            "MATCH (p:DigPermit {id: $permitId})-[:AFFECTS]->(r:RoadSegment) "
            "SET r.status = 'digging' "
            "RETURN r.id as roadId",
            permitId=req.permitId
        )
        
    driver.close()
    return {"message": "Co-digging coordination successfully synced."}

@app.post("/api/chat/query")
def chat_query(body: ChatQuery):
    try:
        answer = run_graph_rag_query(body.query)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
