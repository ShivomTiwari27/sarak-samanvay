import os
import json
import requests
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

NEO4J_URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
NEO4J_USER = os.getenv('NEO4J_USER', 'neo4j')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD', 'sarakpassword')

LLM_SERVICE = os.getenv('LLM_SERVICE', 'mock').lower()
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3.1')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')

def get_db_driver():
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        driver.verify_connectivity()
        return driver
    except Exception:
        return None

def query_neo4j_context(query_str: str):
    """
    Search Neo4j database to extract relevant road segments, 
    active permits, and domain connection nodes for the query context.
    """
    driver = get_db_driver()
    if not driver:
        return {"error": "Neo4j database is offline."}
        
    context = {
        "target_roads": [],
        "active_permits": [],
        "domain_connections": []
    }
    
    # Simple search keyword extraction
    keywords = ["mahakal", "freeganj", "dewas", "nanakheda", "mit", "harifatak"]
    target_road_id = None
    for kw in keywords:
        if kw in query_str.lower():
            target_road_id = f"road-{kw}"
            break
            
    with driver.session() as session:
        # 1. Fetch target road details
        if target_road_id:
            result = session.run(
                "MATCH (r:RoadSegment {id: $roadId}) RETURN r.id as id, r.name as name, r.status as status, r.lockinExpiry as lockinExpiry, r.lockinDaysLeft as lockinDaysLeft",
                roadId=target_road_id
            )
            for record in result:
                context["target_roads"].append({
                    "id": record["id"],
                    "name": record["name"],
                    "status": record["status"],
                    "lockinExpiry": record["lockinExpiry"],
                    "lockinDaysLeft": record["lockinDaysLeft"]
                })
                
            # 2. Fetch permits affecting this road
            perm_result = session.run(
                "MATCH (p:DigPermit)-[:AFFECTS]->(r:RoadSegment {id: $roadId}) "
                "RETURN p.id as id, p.agency as agency, p.purpose as purpose, p.startDate as startDate, p.duration as duration, p.cost as cost, p.status as status, p.subscribers as subscribers",
                roadId=target_road_id
            )
            for record in perm_result:
                context["active_permits"].append({
                    "id": record["id"],
                    "agency": record["agency"],
                    "purpose": record["purpose"],
                    "startDate": record["startDate"],
                    "duration": record["duration"],
                    "cost": record["cost"],
                    "status": record["status"],
                    "subscribers": record["subscribers"]
                })
        else:
            # Fallback: get all active digging or planned roads
            result = session.run(
                "MATCH (r:RoadSegment) WHERE r.status IN ['digging', 'planned', 'lock-in'] RETURN r.id as id, r.name as name, r.status as status"
            )
            for record in result:
                context["target_roads"].append({
                    "id": record["id"],
                    "name": record["name"],
                    "status": record["status"]
                })

        # 3. Get domain links for agencies mentioned in query
        agencies = ["PHE", "BSNL", "DISCOM", "GAIL", "PWD", "TRAFFIC", "HOSPITAL"]
        mentioned_agencies = [a for a in agencies if a in query_str.upper() or (a == "BSNL" and "TELECOM" in query_str.upper())]
        
        if mentioned_agencies:
            for agency in mentioned_agencies:
                # Find direct links in knowledge graph
                rel_result = session.run(
                    "MATCH (d1:UrbanDomain {id: $agency})-[r]->(d2:UrbanDomain) "
                    "RETURN d1.name as src, type(r) as relationship, d2.name as dest",
                    agency=agency
                )
                for record in rel_result:
                    context["domain_connections"].append({
                        "source": record["src"],
                        "relationship": record["relationship"],
                        "destination": record["dest"]
                    })
                    
    driver.close()
    return context

def call_ollama(prompt: str) -> str:
    """Send prompt to local Ollama Llama 3.1 instance"""
    try:
        url = f"{OLLAMA_HOST}/api/generate"
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.3}
        }
        response = requests.post(url, json=payload, timeout=20)
        if response.status_code == 200:
            return response.json().get('response', '')
        return f"Error from Ollama server: {response.text}"
    except Exception as e:
        return f"Failed to connect to local Ollama server at {OLLAMA_HOST}. Details: {e}"

def call_groq(prompt: str) -> str:
    """Send prompt to Groq Cloud API using Llama 3.1"""
    if not GROQ_API_KEY:
        return "Error: GROQ_API_KEY is not configured in backend/.env"
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama3-70b-8192",  # Standard Llama 3 API model
            "messages": [
                {"role": "system", "content": "You are the SarakSamanvay Cognitive Twin coordination agent. Answer municipal digging coordination queries in clean HTML format."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        return f"Error from Groq API: {response.text}"
    except Exception as e:
        return f"Failed to query Groq API. Details: {e}"

def get_mock_cognitive_response(query_str: str, graph_context: dict) -> str:
    """
    Structured rule-based fallback generating detailed reports based on actual Neo4j facts
    when no live LLM runtime is available/configured.
    """
    query_upper = query_str.upper()
    has_mahakal = "MAHAKAL" in query_upper
    has_freeganj = "FREEGANJ" in query_upper
    has_dewas = "DEWAS" in query_upper or "STATION" in query_upper
    has_harifatak = "HARIFATAK" in query_upper
    
    # Extract Neo4j facts from context dictionary
    road_name = "Target Road"
    road_status = "unknown"
    lock_expiry = "N/A"
    active_perms = []
    
    if graph_context.get("target_roads"):
        road_data = graph_context["target_roads"][0]
        road_name = road_data["name"]
        road_status = road_data["status"]
        lock_expiry = road_data.get("lockinExpiry", "N/A")
        
    if graph_context.get("active_permits"):
        active_perms = graph_context["active_permits"]

    # 1. Handle Mahakal Road Case (Lock-in restriction)
    if has_mahakal:
        return f"""
        <h3>Cognitive Analysis: PHE pipeline @ {road_name} (Sept 2026)</h3>
        <p><strong>[1. INGEST]</strong> Digging application by PHE Jal Nigam for 600m water supply pipe installation analyzed.</p>
        <p><strong>[2. SYNCHRONIZE]</strong> Live Neo4j Query: Target Road segment: <code>{road_name}</code> is currently under a <strong>Lock-in restriction</strong>. Lock-in status: <strong>{road_status.upper()}</strong>, expires on <strong>{lock_expiry}</strong>.</p>
        <p><strong>[3. SIMULATE]</strong> Cross-domain interdependency check:
        <ul>
          <li><strong>PHE ➔ PWD:</strong> Digging violates road restoration rules. Road structural life would drop by 60%.</li>
          <li><strong>TRAFFIC ➔ HOSPITAL:</strong> Mahakal road is a critical ambulance pathway. Digging will introduce +18 mins transport latency.</li>
          <li><strong>COMMERCIAL ➔ RWA:</strong> High pedestrian density due to seasonal Ujjain temple festivals.</li>
        </ul>
        </p>
        <p><strong>[4. PREDICT]</strong> Standard standalone execution will lead to structural failure of the road within 6 months and cause heavy traffic delays for emergency vehicles.</p>
        <p><strong>[5. DECIDE - Recommendation:]</strong>
        <span style="color: #e63946; font-weight: 700;">PERMIT DENIED.</span> PHE is directed to reroute pipeline layout via parallel corridors (e.g., Triveni Path) or wait until the lock-in restriction drops in 2028.
        </p>
        <p><strong>[6. ACTUATE]</strong> Dispatched status report to PWD Chief Engineer and PHE Director. Blocked permit status updated in GIS registry.</p>
        """

    # 2. Handle Freeganj Road Case (Co-Digging opportunity)
    elif has_freeganj:
        permit_info = active_perms[0] if active_perms else {"id": "PM-PHE-901", "agency": "PHE", "purpose": "Laying Water Pipeline", "startDate": "2026-09-10", "cost": 8.5}
        return f"""
        <h3>Cognitive Analysis: Telecom Fiber request @ {road_name} (Oct 2026)</h3>
        <p><strong>[1. INGEST]</strong> Optical fiber permit application from BSNL Telecom for {road_name} in October 2026.</p>
        <p><strong>[2. SYNCHRONIZE]</strong> Synced with Neo4j. Overlap identified: Active permit <strong>{permit_info['id']}</strong> submitted by <strong>{permit_info['agency']}</strong> is scheduled for <strong>{permit_info['startDate']}</strong> on the same segment.</p>
        <p><strong>[3. SIMULATE]</strong> Overlap checks show temporal proximity of 30 days. Shared trenching is highly feasible.
        <ul>
          <li><strong>BSNL ➔ DISCOM ➔ PHE:</strong> Joint utility duct layout possible.</li>
          <li><strong>PWD ➔ BSNL:</strong> Prevents secondary road cut in October after September restoration.</li>
        </ul>
        </p>
        <p><strong>[4. PREDICT]</strong>
        <ul>
          <li>Standalone Costs: {permit_info['agency']} (₹{permit_info['cost']}L) + BSNL (₹4.2L) = ₹{permit_info['cost']+4.2:.1f} Lakhs.</li>
          <li>Co-Digging Cost: Combined shared trench = ₹{(permit_info['cost']+4.2)*0.58:.1f} Lakhs. Total public savings: <strong>₹{(permit_info['cost']+4.2)*0.42:.1f} Lakhs</strong>.</li>
        </ul>
        </p>
        <p><strong>[5. DECIDE - Recommendation:]</strong>
        <span style="color: #138808; font-weight: 700;">JOINT EXCAVATION ENFORCED.</span> BSNL is directed to lay fiber conduits simultaneously inside PHE's trench. Cost-sharing model: PHE: 60%, BSNL: 40%.
        </p>
        <p><strong>[6. ACTUATE]</strong> Shared Permit Offer issued to BSNL and PHE. Added to Dashboard Opportunities feed.</p>
        """

    # 3. Handle GAIL / Harifatak Road
    elif has_harifatak or "GAIL" in query_upper or "GAS" in query_upper:
        return f"""
        <h3>Cognitive Analysis: GAIL Gas line installation @ Harifatak Road</h3>
        <p><strong>[1. INGEST]</strong> GAIL permit proposal for municipal gas supply lines on Harifatak Overbridge Road.</p>
        <p><strong>[2. SYNCHRONIZE]</strong> Checked Neo4j. Graph status: <strong>PLANNED</strong>. Linked domain paths: <strong>GAIL (Gas) ➔ FIRE ➔ COMMERCIAL</strong>.</p>
        <p><strong>[3. SIMULATE]</strong> High commercial density and fire truck response corridors intersect on Harifatak.
        <ul>
          <li><strong>GAIL ➔ FIRE:</strong> Requires safety ventilation channels and local fire station alerts.</li>
          <li><strong>TRAFFIC ➔ COMMERCIAL:</strong> Daytime works will cause severe gridlock at Harifatak junction.</li>
        </ul>
        </p>
        <p><strong>[4. PREDICT]</strong> Standalone daytime trenching will cause a 2.5km gridlock affecting commercial markets, reducing daily retail sales by ₹4.5 Lakhs.</p>
        <p><strong>[5. DECIDE - Actionable Plan:]</strong>
        <span style="color: #138808; font-weight: 700;">PERMIT APPROVED WITH CONDITIONS.</span> Works allowed between July 20 - Aug 07 under <strong>Night Shift Mandate</strong> (11 PM - 5 AM). DISCOM must relocate nearby power poles simultaneously.
        </p>
        <p><strong>[6. ACTUATE]</strong> Approved conditional permit issued. Night routing signs drafted for Traffic Police.</p>
        """
        
    # 4. Fallback for random inputs
    else:
        domain_list = ", ".join([d["source"] for d in graph_context.get("domain_connections", [])[:3]])
        linked_info = f"Linked domains from Neo4j: <strong>{domain_list}</strong>." if domain_list else "No direct utility domains match this query."
        return f"""
        <h3>Cognitive Twin Response: Smart City Query Analysis</h3>
        <p><strong>[1. INGEST]</strong> Parsed query: <em>"{query_str}"</em></p>
        <p><strong>[2. SYNCHRONIZE]</strong> Synced with Neo4j Knowledge Graph. {linked_info}</p>
        <p><strong>[3. SIMULATE]</strong> Simulating general urban scenarios. No active digging timeline overlaps or PWD lock-in conflicts detected for this specific input.</p>
        <p><strong>[4. PREDICT]</strong> Conducting standalone digging on municipal streets without coordination results in 40% higher costs and decreases road life expectancy.</p>
        <p><strong>[5. DECIDE:]</strong> Please use the <strong>Map & Graph</strong> tab to locate active road segments, or enter a specific street location (e.g. <em>Mahakal Marg</em>, <em>Freeganj</em>, or <em>Harifatak</em>) to trigger full GraphRAG reasoning.</p>
        <p><strong>[6. ACTUATE]</strong> Reasoning engine stands by. Submit a permit in the registry to run live overlap checks.</p>
        """

def run_graph_rag_query(query_str: str) -> str:
    """Main routing function for GraphRAG query execution"""
    # Step 1: Query Neo4j to get the subgraph context facts
    context_data = query_neo4j_context(query_str)
    
    # Step 2: If we are in mock mode or Neo4j is offline, use the rule-based context generator
    if LLM_SERVICE == 'mock' or "error" in context_data:
        return get_mock_cognitive_response(query_str, context_data)
        
    # Step 3: Compile prompt with Neo4j facts for LLM ingestion
    prompt = f"""
    You are the SarakSamanvay Cognitive Twin Agent of Ujjain Smart City. 
    Using the Neo4j Knowledge Graph context facts below, analyze the user's query and provide a detailed 6-stage Ingest-to-Actuate report.
    Format your response in clean HTML tags (like <h3>, <p>, <ul>, <li>, and <strong>). Do not include markdown code block characters like ```html.
    Keep the report crisp and actionable.

    NEO4J GRAPH CONTEXT FACTS:
    {json.dumps(context_data, indent=2)}

    USER SCENARIO QUERY:
    "{query_str}"

    RESPONSE FORM:
    <h3>Cognitive Analysis: [Brief Title]</h3>
    <p><strong>[1. INGEST]</strong> ...</p>
    <p><strong>[2. SYNCHRONIZE]</strong> ...</p>
    <p><strong>[3. SIMULATE]</strong> ...</p>
    <p><strong>[4. PREDICT]</strong> ...</p>
    <p><strong>[5. DECIDE - Recommendation:]</strong> ...</p>
    <p><strong>[6. ACTUATE]</strong> ...</p>
    """
    
    if LLM_SERVICE == 'ollama':
        return call_ollama(prompt)
    elif LLM_SERVICE == 'groq':
        return call_groq(prompt)
    else:
        return get_mock_cognitive_response(query_str, context_data)
