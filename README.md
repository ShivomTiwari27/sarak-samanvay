# SarakSamanvay: Cognitive Urban Co-Digging Portal

**SarakSamanvay** (Road Coordination Portal) is a full-stack Cognitive Digital Twin (CDT) application designed to coordinate utility road excavations (PHE water pipes, BSNL optical fibers, DISCOM electricity cables, GAIL gas pipelines) in Indian smart cities. 

It implements the engineering and cognitive pillars outlined in Aakanksha Mukati and Prof. Sharad Marolia's research paper *“Evolution Toward Cognitive Urban Intelligence: A Systematic Review of Multi-Domain Digital Twins Integrated with Large Language Models”* (Mahakal Institute of Technology, Ujjain).

---

## 🏗️ Core Architecture & Concept
SarakSamanvay addresses the **"Interdependency Gap"** in municipal governance by linking 20 heterogeneous urban domains into a single reasoning engine.

1. **The Operational Pillar (Yu et al., 2025):** Runs the 6-stage lifecycle pipeline:
   - `Ingest` ➔ `Synchronize` ➔ `Simulate` ➔ `Predict` ➔ `Decide` ➔ `Actuate`
2. **The Cognitive Pillar (Dang et al., 2025):** Maps all urban assets and rules in a **Neo4j Graph Database**.
3. **GraphRAG Reasoning (Llama 3.1):** Traces cross-sector semantic networks to run "What-If" queries, recommending shared trench permits or enforcing PWD road lock-in rules to prevent repeated digging.

```
[User Query] ➔ [FastAPI Backend] ➔ [Query Neo4j Graph Context] ➔ [Prompt Llama 3.1] ➔ [6-Stage UI Report]
```

---

## 🛠️ Tech Stack
- **Frontend:** Glassmorphic Vanilla HTML5 / CSS3 / JavaScript (Leaflet.js GIS map, interactive SVG node-link graph)
- **Backend:** FastAPI (Python 3.12 API Server with CORS configurations)
- **Database:** Neo4j (Graph DBMS storing domains and relationship pathways)
- **AI Agent:** Llama 3.1 (integrated locally via Ollama or remotely via Groq Cloud API)

---

## 📂 Repository Structure
```text
├── backend/
│   ├── .env                  # Connection credentials (ignored in Git)
│   ├── main.py               # FastAPI API endpoints
│   ├── agent.py              # Llama 3.1 GraphRAG handler
│   ├── seed_graph.py         # DB seeding script
│   └── requirements.txt      # Python libraries
├── app.js                    # Frontend logic (Dual-mode hybrid controller)
├── index.html                # App visual layouts & sidebar tabs
├── styles.css                # Glassmorphic dark styling & animations
├── .gitignore                # Pushing protection configurations
└── README.md                 # System documentation
```

---

## 🚀 Setup & Launch Instructions

### 1. Database Setup
1. Download and start **Neo4j Desktop**.
2. Create a local DBMS with the password `sarakpassword` (or adjust settings in `backend/.env`).
3. Click **Start** to run the DB.

### 2. Backend Installation & Seeding
From the project root directory, run:
```powershell
# Install Python dependencies
pip install -r backend/requirements.txt

# Seed the Neo4j database
python backend/seed_graph.py

# Launch the FastAPI API server
python -m uvicorn backend.main:app --port 8000
```

### 3. Open the Frontend Dashboard
Double-click `index.html` or run:
```powershell
Start-Process "index.html"
```
The browser will open the app and connect to your live backend. The sidebar status will display: **● Mode: Live Cognitive Twin (Neo4j Connected)**.

---

## 🧪 Quick Test Scenarios
Try entering these "What-If" questions into the **Cognitive Chat Console**:
- *"What if PHE digs Mahakal Marg for a pipeline in September 2026?"* (Triggers PWD lock-in restriction checks).
- *"What if Telecom lays fiber lines on Freeganj Road in October 2026?"* (Identifies shared-trench co-digging opportunity).
- *"What if GAIL lays gas pipes near Mahakal Temple Zone in July 2026?"* (Checks nighttime execution rules and safety sensors).
