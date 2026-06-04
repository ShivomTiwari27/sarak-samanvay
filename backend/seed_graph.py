#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

NEO4J_URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
NEO4J_USER = os.getenv('NEO4J_USER', 'neo4j')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD', 'sarakpassword')

def get_db_driver():
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        # Verify connectivity
        driver.verify_connectivity()
        return driver
    except Exception as e:
        print("\n" + "="*60)
        print("❌ NEO4J CONNECTION ERROR:")
        print(f"Could not connect to Neo4j database at {NEO4J_URI}")
        print("Ensure Neo4j Desktop is open, your DBMS is STARTED, and credentials in backend/.env are correct.")
        print(f"Details: {e}")
        print("="*60 + "\n")
        return None

def seed_database(driver):
    with driver.session() as session:
        print("🧹 Clearing existing database graph...")
        session.run("MATCH (n) DETACH DELETE n")
        
        print("🧬 Seeding 20 Urban Domains...")
        # Domain definitions: id, label, group (1=Utility, 2=Municipal, 3=Critical, 4=Social)
        domains = [
            ("PHE", "PHE (Water)", 1),
            ("SEW", "Sewerage", 1),
            ("DISCOM", "DISCOM (Power)", 1),
            ("BSNL", "Telecom (Fiber)", 1),
            ("GAIL", "GAIL (Gas)", 1),
            ("PWD", "PWD (Roads)", 2),
            ("TRAFFIC", "Traffic Police", 2),
            ("CCTV", "Smart CCTV", 2),
            ("DRAIN", "Storm Drains", 2),
            ("SOLID_WASTE", "Solid Waste", 2),
            ("LIGHTS", "Street Lights", 2),
            ("HOSPITAL", "Hospitals", 3),
            ("METRO", "Metro Rail", 1),
            ("FORESTRY", "Horticulture", 2),
            ("FIRE", "Fire Services", 3),
            ("DISASTER", "Disaster Cell", 3),
            ("AQI", "Pollution Sensors", 4),
            ("GIS", "GIS Revenue", 2),
            ("COMMERCIAL", "Markets Assoc.", 4),
            ("RWA", "Res. Welfare (RWA)", 4)
        ]
        
        for doc_id, name, grp in domains:
            session.run(
                "CREATE (d:UrbanDomain {id: $id, name: $name, group: $grp})",
                id=doc_id, name=name, grp=grp
            )
            
        print("🔗 Linking cross-domain relationships...")
        relationships = [
            ("PHE", "SEW", "TRENCH_SHARING"),
            ("PHE", "DRAIN", "OVERFLOW_CHECK"),
            ("PHE", "PWD", "ROAD_RESTORATION"),
            ("SEW", "PWD", "EXCAVATION"),
            ("DISCOM", "BSNL", "TRENCH_SHARING"),
            ("DISCOM", "PWD", "POWER_DUCTS"),
            ("BSNL", "PWD", "UTILITY_CORRIDOR"),
            ("BSNL", "CCTV", "NETWORK_LINK"),
            ("GAIL", "PWD", "PIPELINE_SAFETY"),
            ("GAIL", "FIRE", "EMERGENCY_HAZARDS"),
            ("PWD", "TRAFFIC", "ROAD_CLOSURE"),
            ("TRAFFIC", "HOSPITAL", "AMBULANCE_CORRIDOR"),
            ("DISCOM", "LIGHTS", "ELECTRICITY"),
            ("METRO", "PWD", "RIGHT_OF_WAY"),
            ("METRO", "DISCOM", "SUBSTATION_GRID"),
            ("METRO", "TRAFFIC", "DIVERSIONS"),
            ("FORESTRY", "PHE", "WATERING_MAINS"),
            ("DISASTER", "FIRE", "COORDINATION"),
            ("DISASTER", "TRAFFIC", "EVACUATION"),
            ("GIS", "PWD", "MAP_ALIGNMENT"),
            ("COMMERCIAL", "PWD", "BUSINESS_IMPACT"),
            ("COMMERCIAL", "TRAFFIC", "PARKING_LOTS"),
            ("RWA", "PHE", "WATER_SUPPLY"),
            ("RWA", "LIGHTS", "COMPLAINTS"),
            ("AQI", "FORESTRY", "MITIGATION"),
            ("CCTV", "TRAFFIC", "MONITORING")
        ]
        
        for src, tgt, rel in relationships:
            session.run(
                f"MATCH (s:UrbanDomain {{id: $src}}), (t:UrbanDomain {{id: $tgt}}) "
                f"CREATE (s)-[:{rel}]->(t)",
                src=src, tgt=tgt
            )
            
        print("🛣️ Seeding Ujjain Road Network...")
        roads = [
            {
                "id": "road-mahakal",
                "name": "Mahakal Temple Road (Mahakal Marg)",
                "status": "lock-in",
                "lockinExpiry": "2028-06-15",
                "lockinDaysLeft": 742,
                "coordinates": "[[23.182, 75.768], [23.187, 75.774], [23.189, 75.782]]"
            },
            {
                "id": "road-freeganj",
                "name": "Freeganj Main Road",
                "status": "planned",
                "lockinExpiry": "",
                "lockinDaysLeft": 0,
                "coordinates": "[[23.172, 75.789], [23.175, 75.792], [23.178, 75.795]]"
            },
            {
                "id": "road-dewas",
                "name": "Dewas Gate Station Road",
                "status": "digging",
                "lockinExpiry": "",
                "lockinDaysLeft": 0,
                "coordinates": "[[23.188, 75.784], [23.184, 75.789], [23.179, 75.793]]"
            },
            {
                "id": "road-nanakheda",
                "name": "Nanakheda Ring Road",
                "status": "normal",
                "lockinExpiry": "",
                "lockinDaysLeft": 0,
                "coordinates": "[[23.155, 75.779], [23.161, 75.783], [23.167, 75.786]]"
            },
            {
                "id": "road-mit",
                "name": "Mahakal Institute Campus Road (MIT Road)",
                "status": "normal",
                "lockinExpiry": "",
                "lockinDaysLeft": 0,
                "coordinates": "[[23.210, 75.798], [23.214, 75.802], [23.218, 75.807]]"
            },
            {
                "id": "road-harifatak",
                "name": "Harifatak Overbridge Road",
                "status": "planned",
                "lockinExpiry": "",
                "lockinDaysLeft": 0,
                "coordinates": "[[23.175, 75.770], [23.179, 75.778], [23.183, 75.782]]"
            }
        ]
        
        for r in roads:
            session.run(
                "CREATE (road:RoadSegment {id: $id, name: $name, status: $status, lockinExpiry: $lockinExpiry, lockinDaysLeft: $lockinDaysLeft, coordinates: $coords})",
                id=r["id"], name=r["name"], status=r["status"], lockinExpiry=r["lockinExpiry"], lockinDaysLeft=r["lockinDaysLeft"], coords=r["coordinates"]
            )
            
        print("📝 Seeding active permits and linking to roads...")
        permits = [
            {
                "id": "PM-PHE-901",
                "agency": "PHE",
                "roadId": "road-freeganj",
                "roadName": "Freeganj Main Road",
                "startDate": "2026-09-10",
                "duration": 15,
                "purpose": "Laying 400mm Drinking Water Pipeline",
                "cost": 8.5,
                "status": "Co-Digging Open",
                "subscribers": []
            },
            {
                "id": "PM-DIS-804",
                "agency": "DISCOM",
                "roadId": "road-dewas",
                "roadName": "Dewas Gate Station Road",
                "startDate": "2026-06-01",
                "duration": 20,
                "purpose": "Laying HT Power Lines Underground",
                "cost": 11.2,
                "status": "Digging Active",
                "subscribers": ["BSNL"]
            },
            {
                "id": "PM-GAI-720",
                "agency": "GAIL",
                "roadId": "road-harifatak",
                "roadName": "Harifatak Overbridge Road",
                "startDate": "2026-07-20",
                "duration": 18,
                "purpose": "City Gas Pipeline Extension",
                "cost": 9.4,
                "status": "Co-Digging Open",
                "subscribers": []
            }
        ]
        
        for p in permits:
            session.run(
                "CREATE (perm:DigPermit {id: $id, agency: $agency, roadId: $roadId, roadName: $roadName, startDate: $startDate, duration: $duration, purpose: $purpose, cost: $cost, status: $status, subscribers: $subscribers})",
                id=p["id"], agency=p["agency"], roadId=p["roadId"], roadName=p["roadName"], startDate=p["startDate"], duration=p["duration"], purpose=p["purpose"], cost=p["cost"], status=p["status"], subscribers=p["subscribers"]
            )
            # Link Permit to Road segment in Neo4j
            session.run(
                "MATCH (r:RoadSegment {id: $roadId}), (p:DigPermit {id: $id}) "
                "CREATE (p)-[:AFFECTS]->(r)",
                roadId=p["roadId"], id=p["id"]
            )

        print("🎉 Database successfully seeded with 20 domains, streets, and initial permits!")

if __name__ == "__main__":
    db_driver = get_db_driver()
    if db_driver:
        try:
            seed_database(db_driver)
        finally:
            db_driver.close()
    else:
        sys.exit(1)
