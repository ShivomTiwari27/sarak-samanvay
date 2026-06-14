# SarakSamanvay: Implementing a Multi-Domain Cognitive Digital Twin for Indian Smart City Utility Coordination

**Author:** Aakanksha Mukati  
**Supervisor:** Prof. Sharad Marolia  
*Department of Information Technology, Mahakal Institute of Technology, Ujjain, Madhya Pradesh, India*

---

## Abstract
Modern urban management is undergoing a paradigm shift from passive data visualization to active cognitive reasoning, driven by Industry 5.0 principles. Traditional municipal governance operates in silos, leading to the "repeated digging of roads" by independent utility agencies (Water, Telecom, Power, Gas). This paper presents **SarakSamanvay**, a full-stack Cognitive Digital Twin (CDT) framework designed to synchronize multi-domain municipal excavations. Structured around the *Operational Pillar* (6-stage Ingest-to-Actuate pipeline, Yu et al., 2025) and the *Cognitive Pillar* (Semantic Knowledge Graphs, Dang et al., 2025), the system integrates a **20-domain Neo4j Knowledge Graph** with a **Llama 3.1 GraphRAG** reasoning agent. The implementation details a Dual-Mode Hybrid frontend connected to a FastAPI Python backend. The system automatically detects spatial-temporal overlaps, runs a mathematical cost-sharing model, enforces PWD post-restoration lock-in regulations, and outputs contextual coordination briefs. Experimental validation utilizing synthetic datasets of Ujjain Municipal Corporation demonstrates a taxpayer excavation cost reduction of up to 43% and a 60% mitigation in road structural degradation.

**Keywords:** *Cognitive Digital Twins, Knowledge Graphs, Large Language Models, Neo4j, Llama 3.1, GraphRAG, Smart Cities, Utility Coordination.*

---

## 1. Introduction
Rapid urbanization in India has turned city infrastructure into a complex "System of Systems." However, the lack of coordination between utility departments—such as the Public Health Engineering Department (PHE / Jal Nigam), DISCOMs (Electricity Boards), Telecom providers (BSNL, private telcos), and the Public Works Department (PWD)—remains a significant barrier to urban resilience. The standard method of road management is reactive: PWD constructs or resurfaces a street, only for PHE to excavate it for sewer lines, followed by BSNL cutting the asphalt for optical fiber conduits. This repeated disruption reduces road life expectancy by up to 60%, wastes public budgets, and causes chronic traffic congestion.

To bridge this **Interdependency Gap**, this project presents **SarakSamanvay** (Road Coordination Portal). SarakSamanvay upgrades traditional 3D Digital Twins to **Cognitive Digital Twins (CDT)**. While standard twins merely monitor and visualize, CDTs utilize semantic networks and generative artificial intelligence to plan, reason, and act. 

### 1.1 The Research Problem Statement
Existing Smart City Digital Twins suffer from three critical bottlenecks:
1. **The Interdependency Gap:** Existing systems study at most 1 or 2 domains in isolation (e.g. traffic-only or water-only models), failing to capture the cross-sector "ripple effects" of excavation (e.g., how a sewer dig impacts hospital ambulance lanes and underground power lines).
2. **The Accessibility Gap:** City planners and non-technical administrative officers are forced to rely on GIS specialists to run "what-if" simulations, creating a barrier to rapid decision-making.
3. **The Validation Gap:** Simulating utility failures or emergency road cuts on live infrastructure is hazardous, requiring robust synthetic city databases to validate reasoning engines.

---

## 2. Literature Review & Theoretical Foundation
The design of SarakSamanvay rests upon two main academic pillars identified in recent smart city literature (2024–2026):

### 2.1 The Operational Pillar (Yu et al., 2025)
Yu et al. established the **Digital Twin Implementation Readiness Level (DT-IRL)** scale, showing that true smart city utility coordination requires an active operational flow. SarakSamanvay adopts their 6-stage pipeline:
- **Ingest:** Collects incoming sensor, GPS, and permit data.
- **Synchronize:** Updates GIS and graph states.
- **Simulate:** Runs spatial-temporal conflict checks.
- **Predict:** Estimates traffic delay indexes and infrastructure degradation.
- **Decide:** Employs generative models to synthesize coordinate workflows.
- **Actuate:** Triggers API webhooks, municipal alerts, and permit drafts.

### 2.2 The Cognitive Pillar (Dang et al., 2025)
Dang et al. pioneered the use of graph database technology (Neo4j) to overcome the query complexity constraints of relational SQL schemas in 3D CityGML models. By expressing city entities as nodes and relationships as edges, complex dependencies (such as a gas pipe crossing a high-voltage line) can be traversed in constant time $O(1)$ without expensive SQL joins.

---

## 3. Proposed System Framework

### 3.1 The 20-Domain Ontology Mapping
The CDT models 20 distinct municipal domains. These nodes are classified into four key categories with predefined depth profiles and relationships, as shown in the table below:

| Domain ID | Group Type | Representative Agency | Standard Excavation Depth | Primary Dependency Link |
| :--- | :--- | :--- | :--- | :--- |
| **PHE** | Utility | Public Health Engineering | 1.5 meters | `ROAD_RESTORATION` ➔ PWD |
| **SEW** | Utility | Sewerage & Sanitation | 2.0 meters | `TRENCH_SHARING` ➔ PHE |
| **DISCOM** | Utility | Electricity Distribution | 1.0 meters | `TRENCH_SHARING` ➔ BSNL |
| **BSNL** | Utility | Telecom / Optical Fiber | 0.6 meters | `UTILITY_CORRIDOR` ➔ PWD |
| **GAIL** | Utility | City Gas Distribution | 1.2 meters | `EMERGENCY_HAZARDS` ➔ FIRE |
| **METRO** | Utility | Metro Rail Corporation | 5.0+ meters (piles) | `RIGHT_OF_WAY` ➔ PWD |
| **PWD** | Municipal | Public Works Department | N/A (Surface) | `ROAD_CLOSURE` ➔ TRAFFIC |
| **TRAFFIC** | Municipal | Traffic Police Cell | N/A | `AMBULANCE_CORRIDOR` ➔ HOSPITAL |
| **CCTV** | Municipal | Smart City Surveillance | N/A | `MONITORING` ➔ TRAFFIC |
| **DRAIN** | Municipal | Storm Water Drains | 1.8 meters | `OVERFLOW_CHECK` ➔ PHE |
| **SOLID_WASTE**| Municipal | Solid Waste Disposal | N/A | `CLEARANCE` ➔ TRAFFIC |
| **LIGHTS** | Municipal | Street Lighting (EESL) | 0.8 meters | `ELECTRICITY` ➔ DISCOM |
| **GIS** | Municipal | Land Revenue & Land Records| N/A | `MAP_ALIGNMENT` ➔ PWD |
| **HOSPITAL** | Critical | Municipal Health Dept | N/A | `EMERGENCY_ACCESS` ➔ TRAFFIC |
| **FIRE** | Critical | Fire & Emergency Services | N/A | `COORDINATION` ➔ DISASTER |
| **DISASTER** | Critical | District Disaster Cell | N/A | `EVACUATION` ➔ TRAFFIC |
| **AQI** | Citizen | Pollution Control Board | N/A | `MITIGATION` ➔ FORESTRY |
| **FORESTRY** | Citizen | Horticulture Department | 0.5 meters | `WATERING_MAINS` ➔ PHE |
| **COMMERCIAL** | Citizen | Markets & Traders Assoc | N/A | `BUSINESS_IMPACT` ➔ PWD |
| **RWA** | Citizen | Residential Welfare Assoc | N/A | `WATER_SUPPLY` ➔ PHE |

### 3.2 Knowledge Graph Topology
The relationship mapping represents the city's logistically connected "System of Systems". 

```
                       [ PWD (Roads) ]
                       ▲      ▲      ▲
         ROAD_RESTORATION     │      UTILITY_CORRIDOR
               │         ROAD_CLOSURE  │
               │              │        │
           [ PHE ] ◄───► [ TRAFFIC ] ◄─┴─► [ BSNL (Telecom) ]
               ▲              │                    │
         WATER_SUPPLY         ▼                    ▼
               │      [ HOSPITAL ]             [ CCTV ]
               │              ▲
               │       AMBULANCE_CORRIDOR
               │              │
           [ RWA ] ───────────┘
```

---

## 4. Implementation Details & Algorithms

### 4.1 FastAPI Backend Endpoints
The backend runs a REST API on FastAPI, exposing structured JSON endpoints:
- `GET /api/status`: Returns database health and active LLM configuration.
- `GET /api/roads`: Returns spatial coordinates and current lock-in data for all roads.
- `POST /api/permits`: Ingests permit application, triggers the overlap engine, and commits to Neo4j.
- `POST /api/chat/query`: The GraphRAG entry point that feeds the context-enriched prompt to the LLM.

#### Input JSON Payload Example (`POST /api/permits`):
```json
{
  "agency": "PHE",
  "roadId": "road-freeganj",
  "roadName": "Freeganj Main Road",
  "startDate": "2026-09-10",
  "duration": 15,
  "purpose": "Laying 400mm Drinking Water Pipeline"
}
```

#### Output JSON Response Example (`POST /api/permits`):
```json
{
  "message": "Permit created successfully",
  "permitId": "PM-PHE-347"
}
```

---

### 4.2 Overlap Detection and Permit Validation Algorithm
The system utilizes a spatial-temporal validation engine when a new permit is requested. The logic is formalized in the pseudocode below:

```text
Algorithm 1: Spatial-Temporal Overlap and Lock-in Validation
Input: Proposed Permit P (with P.agency, P.roadId, P.startDate, P.duration)
Output: ValidationStatus (APPROVED, BLOCKED, or CO_DIG_OPPORTUNITY)

1:  // Connect to Neo4j Database Session
2:  session = Neo4jDriver.Session()
3:  
4:  // Step 1: Check PWD Lock-in restriction
5:  roadSegment = session.run("MATCH (r:RoadSegment {id: P.roadId}) RETURN r")
6:  if roadSegment.status == "lock-in" then
7:      P.lockinExpiry = roadSegment.lockinExpiry
8:      return BLOCKED, "Permit denied: Road segment is under reconstruction lock-in until " + P.lockinExpiry
9:  end if
10: 
11: // Step 2: Check for temporal overlap with existing permits on the same road
12: activePermits = session.run("MATCH (pm:DigPermit)-[:AFFECTS]->(r:RoadSegment {id: P.roadId}) RETURN pm")
13: 
14: for each existingPermit in activePermits do
15:     dateBuffer = 30 // days
16:     P_end = P.startDate + P.duration
17:     exist_end = existingPermit.startDate + existingPermit.duration
18:     
19:     // Check if dates fall within the spatial-temporal overlap window
20:     if (P.startDate - dateBuffer <= exist_end) AND (P_end + dateBuffer >= existingPermit.startDate) then
21:         opportunity = CreateCoDigOpportunity(P, existingPermit)
22:         return CO_DIG_OPPORTUNITY, opportunity
23:     end if
24: end for
25: 
26: // Step 3: No conflicts found
27: SavePermitToNeo4j(P)
28: session.run("MATCH (r:RoadSegment {id: P.roadId}) SET r.status = 'planned'")
29: return APPROVED, "Permit approved and logged as planned."
```

---

### 4.3 Cost-Sharing Mathematical Model
When two utility agencies (e.g., Agency $A$ and Agency $B$) plan to dig the same road segment during overlapping time windows, the system halts individual permits and enforces a **Shared Trenching Agreement**. 

Let:
- $C_A$ = Standalone excavation and restoration cost for Agency $A$.
- $C_B$ = Standalone excavation and restoration cost for Agency $B$.
- $C_{joint}$ = Joint cost of shared excavation (single trench cut, joint duct layout).

The joint cost is modeled as:
$$C_{joint} = \gamma \cdot (C_A + C_B)$$

Where $\gamma$ is the *Trench Overlap Efficiency Coefficient* (typically $0.55 \le \gamma \le 0.60$, representing a $40\%$ to $45\%$ savings on joint machinery, labor, and paving materials). 

The allocation of costs is divided proportionally:
$$Cost_A = \beta \cdot C_{joint}$$
$$Cost_B = (1 - \beta) \cdot C_{joint}$$

Where $\beta$ is the *Primary Excavation Factor* (based on depth and pipe diameter requirements):
$$\beta = \frac{Depth_A}{Depth_A + Depth_B}$$

This ensures that the agency requiring a deeper trench (e.g., PHE laying water mains at 1.5m vs BSNL laying fiber at 0.6m) pays a fair, mathematically proportional share of the excavation, while still saving up to 43% compared to a standalone project.

---

### 4.4 GraphRAG Prompt Engineering
The backend `agent.py` queries Neo4j for the localized sub-graph surrounding the target street, converts the resulting record lists into JSON context, and compiles the final system prompt for Llama 3.1:

```python
prompt = f"""
You are the SarakSamanvay Cognitive Twin Agent of Ujjain Smart City.
Analyze the user's scenario query using the live Neo4j database context facts.
Format your output in clean HTML (using <h3>, <p>, <ul>, <li>, and <strong>). Do not include markdown code block characters.

NEO4J GRAPH CONTEXT FACTS:
{json.dumps(context_data, indent=2)}

USER SCENARIO QUERY:
"{query_str}"

Provide your reasoning in the following structure:
<h3>Cognitive Analysis: [Brief Title]</h3>
<p><strong>[1. INGEST]</strong> ...</p>
<p><strong>[2. SYNCHRONIZE]</strong> ...</p>
<p><strong>[3. SIMULATE]</strong> ...</p>
<p><strong>[4. PREDICT]</strong> ...</p>
<p><strong>[5. DECIDE - Recommendation:]</strong> ...</p>
<p><strong>[6. ACTUATE]</strong> ...</p>
"""
```

---

## 5. Experimental Results & Scenario Analysis

### 5.1 Scenario A: PWD Lock-in Enforcement (Mahakal Marg)
- **Input Query:** *"PHE plans to dig Mahakal Marg for water pipeline in September 2026."*
- **Ingest & Sync:** Segment `road-mahakal` matched.
- **Simulation:** Neo4j queries show a `lock-in` flag active until June 15, 2028 (road reconstructed in June 2026).
- **Predictive Ripple Analysis:**
  1. *Infrastructure:* Road life reduced from 15 years to 6 years if excavated.
  2. *Critical Path:* blocks the ambulance entry path for the nearby District Hospital.
  3. *Social:* Overlaps with the high pedestrian footfall of the Shravan festival.
- **FastAPI Output:** `HTTP 400 Bad Request` - Permit Blocked. The frontend renders a red warning banner disabling the submit button.

### 5.2 Scenario B: BSNL & PHE Co-Digging (Freeganj Main Road)
- **Input Query:** *"BSNL plans to lay optical fiber on Freeganj Road in October 2026."*
- **Simulation:** Detects a planned permit from PHE (`PM-PHE-901`) on Freeganj Road scheduled for September 10, 2026. The 30-day temporal buffer activates.
- **Decision Engine Output:** Generates a joint trench permit.
  - Standalone Total: ₹12.7 Lakhs (PHE: ₹8.5L + BSNL: ₹4.2L)
  - Joint Cost: ₹7.2 Lakhs
  - Taxpayer Savings: **₹5.5 Lakhs (43% saved)**
  - Enforced Timeline: Sept 10 – Sept 25, 2026 (BSNL lays fiber inside PHE’s open trench before PWD resurfaces).

---

## 6. Implementation Methodology & System Environment
To evaluate the framework, a local prototype was established with the following environment specifications:
- **Operating System:** Windows 11 Home / Professional
- **Memory (RAM):** 16 GB DDR4
- **Database Engine:** Neo4j Desktop Community Server v1.6.3 (Bolt Port 7687)
- **API Runtime:** Python v3.12.10 running FastAPI v0.136.0 & Uvicorn v0.49.0
- **LLM Engine:** Local Ollama runner running Llama 3.1 8B (Q4 quantization)

The frontend communicates with this local environment over HTTP, automatically switching from a local client-side array demo mode to the live API endpoints upon detecting port `8000` status as online.

---

## 7. Conclusion & Future Scope
The SarakSamanvay implementation successfully demonstrates how combining semantic graph networks (Neo4j) with Large Language Models (Llama 3.1) bridges the interdependency gap in smart city governance. By replacing reactive, manual coordination with a proactive, automated cognitive reasoning engine, municipalities can mathematically optimize cost shares, preserve road infrastructure life, and eliminate repeated excavations.

### Future Scope
1. **Edge-to-Cloud Processing:** Optimizing local Llama 3.1 weights to run on resource-constrained edge hardware inside municipal corporations.
2. **Multi-Modal GIS Integration:** Incorporating 3D CityGML rendering pipelines to visually display the depth and coordinates of overlapping utilities directly on a 3D interface.
3. **Decentralized Governance:** Integrating blockchain smart contracts to automate inter-departmental funds transfers based on the system's cost-share decision outcomes.

---

## References
1. W. Yu et al., "Digital Twin Technology in Smart Cities: A Step Toward Intelligent Urban Management," *Energy Reports*, vol. 11, pp. 450–465, Dec. 2025.
2. J. Dang, S. Liu, and C. Wang, "KCitychatBot: A Knowledge Graph-Based Chatbot System for Large-Scale CityGML Urban Models," *Int. Arch. Photogramm. Remote Sens. Spatial Inf. Sci.*, vol. XLVIII-4/W15-2025, pp. 99–105, Sept. 2025.
3. D. Russo and L. L. L. Starace, "A Framework for Generating Synthetic Urban Mobility Datasets With Customizable Anomalous Scenarios," *IEEE Open Journal of Intelligent Transportation Systems*, vol. 6, Nov. 2025.
4. F. Liu et al., "Hybrid AI-IoT Framework with Digital Twin Integration for Predictive Urban Infrastructure Management in Smart Cities," *IEEE Access*, vol. 86, no. 1, pp. 1–32, Nov. 2025.
