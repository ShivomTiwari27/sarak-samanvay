/**
 * SarakSamanvay - Cognitive Urban Co-Digging Portal
 * Application Logic & Client-Side Digital Twin Simulation
 */

// Global Application State
const state = {
  activeTab: 'dashboard',
  backendLive: false,
  backendUrl: 'http://localhost:8000',
  stats: {
    prevented: 14,
    savings: 42.8, // in Lakhs
    activeCodig: 4,
    lockinCount: 8
  },
  roads: [
    {
      id: 'road-mahakal',
      name: 'Mahakal Temple Road (Mahakal Marg)',
      coordinates: [[23.182, 75.768], [23.187, 75.774], [23.189, 75.782]],
      status: 'lock-in', // lock-in, digging, planned, normal
      lockinExpiry: '2028-06-15',
      lockinDaysLeft: 742,
      activePermits: []
    },
    {
      id: 'road-freeganj',
      name: 'Freeganj Main Road',
      coordinates: [[23.172, 75.789], [23.175, 75.792], [23.178, 75.795]],
      status: 'planned',
      lockinExpiry: null,
      activePermits: ['PM-PHE-901']
    },
    {
      id: 'road-dewas',
      name: 'Dewas Gate Station Road',
      coordinates: [[23.188, 75.784], [23.184, 75.789], [23.179, 75.793]],
      status: 'digging',
      lockinExpiry: null,
      activePermits: ['PM-DIS-804']
    },
    {
      id: 'road-nanakheda',
      name: 'Nanakheda Ring Road',
      coordinates: [[23.155, 75.779], [23.161, 75.783], [23.167, 75.786]],
      status: 'normal',
      lockinExpiry: null,
      activePermits: []
    },
    {
      id: 'road-mit',
      name: 'Mahakal Institute Campus Road (MIT Road)',
      coordinates: [[23.210, 75.798], [23.214, 75.802], [23.218, 75.807]],
      status: 'normal',
      lockinExpiry: null,
      activePermits: []
    },
    {
      id: 'road-harifatak',
      name: 'Harifatak Overbridge Road',
      coordinates: [[23.175, 75.770], [23.179, 75.778], [23.183, 75.782]],
      status: 'planned',
      lockinExpiry: null,
      activePermits: ['PM-GAI-720']
    }
  ],
  permits: [
    {
      id: 'PM-PHE-901',
      agency: 'PHE',
      roadId: 'road-freeganj',
      roadName: 'Freeganj Main Road',
      startDate: '2026-09-10',
      duration: 15,
      purpose: 'Laying 400mm Drinking Water Pipeline',
      cost: 8.5, // Lakhs
      status: 'Co-Digging Open',
      subscribers: []
    },
    {
      id: 'PM-DIS-804',
      agency: 'DISCOM',
      roadId: 'road-dewas',
      roadName: 'Dewas Gate Station Road',
      startDate: '2026-06-01',
      duration: 20,
      purpose: 'Laying HT Power Lines Underground',
      cost: 11.2,
      status: 'Digging Active',
      subscribers: ['BSNL'] // Telecom joined, saving money
    },
    {
      id: 'PM-GAI-720',
      agency: 'GAIL',
      roadId: 'road-harifatak',
      roadName: 'Harifatak Overbridge Road',
      startDate: '2026-07-20',
      duration: 18,
      purpose: 'City Gas Pipeline Extension',
      cost: 9.4,
      status: 'Co-Digging Open',
      subscribers: []
    }
  ],
  coDigOpportunities: [
    {
      id: 'opp-1',
      targetRoad: 'road-freeganj',
      roadName: 'Freeganj Main Road',
      leadAgency: 'PHE',
      leadPermitId: 'PM-PHE-901',
      proposedDates: 'Sep 10, 2026 - Sep 25, 2026',
      potentialPartner: 'Telecom (BSNL)',
      overlapReason: 'BSNL requested optical fiber routing in same zone within 30-day window.',
      estimatedSavings: 3.5 // in Lakhs
    },
    {
      id: 'opp-2',
      targetRoad: 'road-harifatak',
      roadName: 'Harifatak Overbridge Road',
      leadAgency: 'GAIL',
      leadPermitId: 'PM-GAI-720',
      proposedDates: 'Jul 20, 2026 - Aug 07, 2026',
      potentialPartner: 'DISCOM',
      overlapReason: 'DISCOM has pending transformer relocation request near Harifatak junction.',
      estimatedSavings: 4.1
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      type: 'warning',
      text: 'CO-DIG ALERT: BSNL optical fiber plans on Freeganj Road overlap with PHE water pipe proposal. Action required.',
      time: '12 mins ago'
    },
    {
      id: 'notif-2',
      type: 'success',
      text: 'CO-DIG AGREEMENT SIGNED: DISCOM & BSNL completed underground cabling at Dewas Gate. Saved ₹4.8 Lakhs.',
      time: '2 hours ago'
    },
    {
      id: 'notif-3',
      type: 'error',
      text: 'PWD LOCK-IN NOTICE: Mahakal Temple Road reconstructed today. 2-Year excavation lock-in active until June 2028.',
      time: '4 hours ago'
    }
  ],
  graphData: {
    nodes: [
      // Group: 1=Utility, 2=Municipal, 3=Critical, 4=Social/Citizen
      { id: 'PHE', label: 'PHE (Water)', group: 1, x: 220, y: 150 },
      { id: 'SEW', label: 'Sewerage', group: 1, x: 140, y: 130 },
      { id: 'DISCOM', label: 'DISCOM (Power)', group: 1, x: 300, y: 180 },
      { id: 'BSNL', label: 'Telecom (Fiber)', group: 1, x: 380, y: 160 },
      { id: 'GAIL', label: 'GAIL (Gas)', group: 1, x: 280, y: 260 },
      { id: 'PWD', label: 'PWD (Roads)', group: 2, x: 300, y: 80 },
      { id: 'TRAFFIC', label: 'Traffic Police', group: 2, x: 440, y: 90 },
      { id: 'CCTV', label: 'Smart CCTV', group: 2, x: 460, y: 180 },
      { id: 'DRAIN', label: 'Storm Drains', group: 2, x: 120, y: 220 },
      { id: 'SOLID_WASTE', label: 'Solid Waste', group: 2, x: 110, y: 300 },
      { id: 'LIGHTS', label: 'Street Lights', group: 2, x: 380, y: 250 },
      { id: 'HOSPITAL', label: 'Hospitals', group: 3, x: 190, y: 70 },
      { id: 'METRO', label: 'Metro Rail', group: 1, x: 200, y: 350 },
      { id: 'FORESTRY', label: 'Horticulture', group: 2, x: 360, y: 340 },
      { id: 'FIRE', label: 'Fire Services', group: 3, x: 280, y: 420 },
      { id: 'DISASTER', label: 'Disaster Cell', group: 3, x: 460, y: 320 },
      { id: 'AQI', label: 'Pollution Sensors', group: 4, x: 490, y: 250 },
      { id: 'GIS', label: 'GIS Revenue', group: 2, x: 200, y: 230 },
      { id: 'COMMERCIAL', label: 'Markets Assoc.', group: 4, x: 370, y: 410 },
      { id: 'RWA', label: 'Res. Welfare (RWA)', group: 4, x: 120, y: 390 }
    ],
    links: [
      { source: 'PHE', target: 'SEW', type: 'trench-sharing' },
      { source: 'PHE', target: 'DRAIN', type: 'overflow' },
      { source: 'PHE', target: 'PWD', type: 'road-restoration' },
      { source: 'SEW', target: 'PWD', type: 'excavation' },
      { source: 'DISCOM', target: 'BSNL', type: 'trench-sharing' },
      { source: 'DISCOM', target: 'PWD', type: 'power-ducts' },
      { source: 'BSNL', target: 'PWD', type: 'utility-corridor' },
      { source: 'BSNL', target: 'CCTV', type: 'network' },
      { source: 'GAIL', target: 'PWD', type: 'pipeline-safety' },
      { source: 'GAIL', target: 'FIRE', type: 'emergency-hazards' },
      { source: 'PWD', target: 'TRAFFIC', type: 'road-closure' },
      { source: 'TRAFFIC', target: 'HOSPITAL', type: 'ambulance-corridor' },
      { source: 'DISCOM', target: 'LIGHTS', type: 'electricity' },
      { source: 'METRO', target: 'PWD', type: 'right-of-way' },
      { source: 'METRO', target: 'DISCOM', type: 'substation-grid' },
      { source: 'METRO', target: 'TRAFFIC', type: 'diversions' },
      { source: 'FORESTRY', target: 'PHE', type: 'watering-mains' },
      { source: 'DISASTER', target: 'FIRE', type: 'coordination' },
      { source: 'DISASTER', target: 'TRAFFIC', type: 'evacuation' },
      { source: 'GIS', target: 'PWD', type: 'map-alignment' },
      { source: 'COMMERCIAL', target: 'PWD', type: 'business-impact' },
      { source: 'COMMERCIAL', target: 'TRAFFIC', type: 'parking' },
      { source: 'RWA', target: 'PHE', type: 'water-supply' },
      { source: 'RWA', target: 'LIGHTS', type: 'complaints' },
      { source: 'AQI', target: 'FORESTRY', type: 'mitigation' },
      { source: 'CCTV', target: 'TRAFFIC', type: 'monitoring' }
    ]
  },
  chatHistory: [
    {
      sender: 'agent',
      text: `<h3>Welcome to SarakSamanvay Cognitive Console</h3>
      <p>I am the <strong>Llama 3.1 Cognitive Twin Agent</strong> for Ujjain Smart City. I resolve urban silo problems by analyzing interdependencies between <strong>20 urban domains</strong> using our Neo4j Knowledge Graph.</p>
      <p>You can ask me "What-If" scenarios about utility works. For example:</p>
      <ul>
        <li><em>"What if PHE digs Mahakal Marg for a pipeline in September 2026?"</em></li>
        <li><em>"What if Telecom lays fiber lines on Freeganj Road in October 2026?"</em></li>
      </ul>
      <p>I will run the 6-stage <strong>Ingest-to-Actuate</strong> pipeline to predict cross-domain ripple effects and propose optimal cost-sharing, sequential excavation schedules, and road lock-in policies.</p>`
    }
  ]
};

// Leaflet Map instance
let map = null;
let roadLayers = {};

// SVG Drag-and-drop state
let selectedNode = null;
let dragOffset = { x: 0, y: 0 };
let activeFocusedNode = null;

// Initialize Web Application
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initGraph();
  initMap();
  initHudControls();
  
  // Check backend status first
  await checkBackendStatus();
  
  initDashboard();
  initChat();
  initPermitForm();
  initAgreementModal();
  
  // Render icons
  lucide.createIcons();
});

// Check if FastAPI backend is online and sync data
async function checkBackendStatus() {
  const badgeVal = document.querySelector('.badge-value');
  const badgeTitle = document.querySelector('.badge-title');
  const indicator = document.querySelector('.pulse-indicator');
  
  try {
    const res = await fetch(`${state.backendUrl}/api/status`);
    if (res.ok) {
      const data = await res.json();
      state.backendLive = true;
      
      // Update sidebar visual indicator
      badgeVal.textContent = "Live Cognitive Twin";
      badgeTitle.textContent = "Mode: API Connected";
      indicator.style.backgroundColor = "#138808"; // make pulse green
      indicator.style.boxShadow = "0 0 10px #138808";
      
      console.log("⚡ SarakSamanvay Backend active. Syncing live Neo4j database data...");
      await syncDataFromBackend();
    } else {
      setOfflineMode();
    }
  } catch (err) {
    setOfflineMode();
  }
}

function setOfflineMode() {
  state.backendLive = false;
  const badgeVal = document.querySelector('.badge-value');
  const badgeTitle = document.querySelector('.badge-title');
  const indicator = document.querySelector('.pulse-indicator');
  
  badgeVal.textContent = "Llama 3.1 + GraphRAG";
  badgeTitle.textContent = "Mode: Demo (Offline)";
  indicator.style.backgroundColor = "#ff9933"; // orange pulse
  indicator.style.boxShadow = "0 0 10px #ff9933";
  
  console.log("ℹ️ FastAPI Backend offline. Running in client-side Demo mode.");
}

async function syncDataFromBackend() {
  if (!state.backendLive) return;
  
  try {
    // 1. Fetch Roads
    const roadsRes = await fetch(`${state.backendUrl}/api/roads`);
    if (roadsRes.ok) {
      state.roads = await roadsRes.json();
    }
    
    // 2. Fetch Permits
    const permitsRes = await fetch(`${state.backendUrl}/api/permits`);
    if (permitsRes.ok) {
      state.permits = await permitsRes.json();
    }
    
    // 3. Fetch Opportunities
    const oppsRes = await fetch(`${state.backendUrl}/api/opportunities`);
    if (oppsRes.ok) {
      state.coDigOpportunities = await oppsRes.json();
    }
    
    // Recalculate statistics dynamically based on live database status
    recalculateStats();
    
    // Redraw roads on Leaflet Map
    if (map) {
      renderRoadsOnMap();
    }
  } catch (err) {
    console.error("Failed to sync database data from API:", err);
  }
}

function recalculateStats() {
  const completedRestoredCount = state.roads.filter(r => r.status === 'lock-in').length;
  const activeSyncedCount = state.permits.filter(p => p.subscribers && p.subscribers.length > 0).length;
  
  state.stats.lockinCount = completedRestoredCount;
  state.stats.activeCodig = state.permits.filter(p => p.status === 'Co-Digging Open' || p.status === 'Co-Digging Synced').length;
  
  // Dynamic mock addition of savings based on synced count
  let calculatedSavings = 25.5; // base
  state.permits.forEach(p => {
    if (p.subscribers && p.subscribers.length > 0) {
      calculatedSavings += (p.cost * 0.4); // 40% savings
    }
  });
  
  state.stats.savings = calculatedSavings;
  state.stats.prevented = 10 + activeSyncedCount;
}

// Tab Routing Configuration
function initTabs() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabs = document.querySelectorAll('.tab-content');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      navBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${tabId}-tab`).classList.add('active');
      state.activeTab = tabId;
      
      // Leaflet needs recalculation of size when tab becomes visible
      if (tabId === 'map-view' && map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    });
  });
}

// Dashboard statistics and listings renderer
function initDashboard() {
  updateStats();
  renderOpportunities();
  renderActiveOperations();
  renderNotifications();
  renderLockins();
}

function updateStats() {
  document.getElementById('stat-prevented').textContent = state.stats.prevented;
  document.getElementById('stat-savings').textContent = `₹${state.stats.savings.toFixed(1)}L`;
  document.getElementById('stat-active-codig').textContent = state.stats.activeCodig;
  document.getElementById('stat-lockin').textContent = state.stats.lockinCount;
}

function renderOpportunities() {
  const container = document.getElementById('opportunities-container');
  container.innerHTML = '';
  
  if (state.coDigOpportunities.length === 0) {
    container.innerHTML = `<div class="text-center text-muted py-4">No pending co-digging opportunities. Submit a permit to trigger conflict analysis.</div>`;
    return;
  }
  
  state.coDigOpportunities.forEach(opp => {
    const oppElement = document.createElement('div');
    oppElement.className = 'opp-item';
    oppElement.innerHTML = `
      <div class="opp-header">
        <span class="opp-road">${opp.roadName}</span>
        <span class="badge badge-warning">Sync Alert</span>
      </div>
      <div class="opp-body">
        <span class="agency-tag">${opp.leadAgency} (Owner)</span>
        <span class="arrow-join">➔</span>
        <span class="agency-tag">${opp.potentialPartner} (Overlap)</span>
      </div>
      <p class="opp-details">${opp.overlapReason}</p>
      <div class="opp-actions">
        <span class="opp-savings-label"><i data-lucide="piggy-bank"></i> Est. Savings: ₹${parseFloat(opp.estimatedSavings).toFixed(1)} Lakhs</span>
        <button class="btn btn-primary btn-small join-btn" data-opp-id="${opp.id}">
          <i data-lucide="merge"></i> Coordinate Co-Dig
        </button>
      </div>
    `;
    
    // Add handler for click
    oppElement.querySelector('.join-btn').addEventListener('click', () => {
      openAgreementModal(opp);
    });
    
    container.appendChild(oppElement);
  });
  
  lucide.createIcons({ attrs: { class: 'lucide-icon-inline' } });
}

function renderActiveOperations() {
  const container = document.getElementById('operations-container');
  container.innerHTML = '';
  
  state.permits.forEach(p => {
    let statusClass = 'orange';
    let statusLabel = 'Standalone Digging';
    
    const isSynced = p.subscribers && p.subscribers.length > 0;
    
    if (p.status.includes('Co-Digging Open')) {
      statusClass = 'orange';
      statusLabel = 'Open for Joint Works';
    } else if (p.status.includes('Active') || p.status.includes('Synced')) {
      statusClass = isSynced ? 'green' : 'orange';
      statusLabel = isSynced 
        ? `Co-Digging: ${p.agency} + ${p.subscribers.join(', ')}` 
        : 'Active Trenching';
    }
    
    const opElement = document.createElement('div');
    opElement.className = 'op-item';
    opElement.innerHTML = `
      <div class="op-info">
        <span class="op-title">${p.roadName} (${p.purpose})</span>
        <span class="op-meta">Start: ${p.startDate} | Duration: ${p.duration} days | Cost: ₹${p.cost}L</span>
      </div>
      <div class="op-status">
        <span class="dot-pulse ${statusClass}"></span>
        <span class="badge ${isSynced ? 'badge-success' : 'badge-info'}">${statusLabel}</span>
      </div>
    `;
    container.appendChild(opElement);
  });
}

function renderNotifications() {
  const container = document.getElementById('notification-stream-container');
  container.innerHTML = '';
  
  state.notifications.forEach(n => {
    let icon = 'activity';
    let iconClass = 'info';
    
    if (n.type === 'warning') {
      icon = 'alert-triangle';
      iconClass = 'warning';
    } else if (n.type === 'success') {
      icon = 'check-circle2';
      iconClass = 'success';
    } else if (n.type === 'error') {
      icon = 'lock';
      iconClass = 'error';
    }
    
    const item = document.createElement('div');
    item.className = 'stream-item';
    item.innerHTML = `
      <div class="stream-icon ${iconClass}"><i data-lucide="${icon}"></i></div>
      <div class="stream-content">
        <span class="stream-text">${n.text}</span>
        <span class="stream-time">${n.time}</span>
      </div>
    `;
    container.appendChild(item);
  });
  
  document.getElementById('alert-badge-count').textContent = state.notifications.length;
  lucide.createIcons();
}

function renderLockins() {
  const container = document.getElementById('lock-in-container');
  container.innerHTML = '';
  
  state.roads.filter(r => r.status === 'lock-in').forEach(r => {
    const item = document.createElement('div');
    item.className = 'lock-item';
    item.innerHTML = `
      <div class="lock-info">
        <span class="lock-road">${r.name}</span>
        <span class="lock-expiry">Lock-in until ${r.lockinExpiry} (${r.lockinDaysLeft} days left)</span>
      </div>
      <span class="badge badge-danger"><i data-lucide="lock" class="size-12"></i> Restricted</span>
    `;
    container.appendChild(item);
  });
  lucide.createIcons();
}

// 20-Domain Knowledge Graph Rendering (SVG Canvas)
function initGraph() {
  const svg = document.getElementById('graph-canvas');
  const gNodes = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gNodes.setAttribute('id', 'nodes-group');
  const gLinks = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gLinks.setAttribute('id', 'links-group');
  
  svg.appendChild(gLinks);
  svg.appendChild(gNodes);

  // Setup reset focus button
  document.getElementById('reset-graph-btn').addEventListener('click', () => {
    focusGraphNode(null);
  });

  renderGraph();
}

function renderGraph() {
  const nodesContainer = document.getElementById('nodes-group');
  const linksContainer = document.getElementById('links-group');
  
  nodesContainer.innerHTML = '';
  linksContainer.innerHTML = '';
  
  // Render Links
  state.graphData.links.forEach((link, index) => {
    const sourceNode = state.graphData.nodes.find(n => n.id === link.source);
    const targetNode = state.graphData.nodes.find(n => n.id === link.target);
    
    if (sourceNode && targetNode) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute('x1', sourceNode.x);
      line.setAttribute('y1', sourceNode.y);
      line.setAttribute('x2', targetNode.x);
      line.setAttribute('y2', targetNode.y);
      line.setAttribute('class', 'graph-link');
      line.setAttribute('id', `link-${index}`);
      link.element = line;
      linksContainer.appendChild(line);
    }
  });

  // Render Nodes
  state.graphData.nodes.forEach(node => {
    const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
    groupElement.setAttribute('class', `node ${getNodeClass(node.group)}`);
    groupElement.setAttribute('id', `node-${node.id}`);
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('r', '15');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('class', 'node-circle');
    
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + 4);
    text.setAttribute('class', 'node-label');
    text.textContent = node.id;
    
    groupElement.appendChild(circle);
    groupElement.appendChild(text);
    
    // Wire dragging and selection
    groupElement.addEventListener('mousedown', (e) => startDrag(e, node, groupElement));
    groupElement.addEventListener('click', (e) => {
      // If we didn't drag much, trigger click focus
      if (!groupElement.classList.contains('dragging-active')) {
        focusGraphNode(node);
      }
      groupElement.classList.remove('dragging-active');
    });
    
    node.element = groupElement;
    nodesContainer.appendChild(groupElement);
  });
}

function getNodeClass(group) {
  switch(group) {
    case 1: return 'domain-utility';
    case 2: return 'domain-municipal';
    case 3: return 'domain-critical';
    case 4: return 'domain-social';
    default: return '';
  }
}

// Simple drag & drop implementation for SVG nodes
function startDrag(e, node, element) {
  e.preventDefault();
  selectedNode = { node, element };
  const rect = document.getElementById('graph-canvas').getBoundingClientRect();
  dragOffset.x = e.clientX - node.x;
  dragOffset.y = e.clientY - node.y;
  
  let totalMove = 0;
  
  function onMouseMove(moveEvent) {
    totalMove += Math.abs(moveEvent.movementX) + Math.abs(moveEvent.movementY);
    if (totalMove > 5) {
      element.classList.add('dragging-active');
    }
    
    node.x = moveEvent.clientX - dragOffset.x;
    node.y = moveEvent.clientY - dragOffset.y;
    
    // Boundary check for coordinates
    node.x = Math.max(20, Math.min(580, node.x));
    node.y = Math.max(20, Math.min(480, node.y));
    
    // Update SVG elements
    const circle = element.querySelector('.node-circle');
    const text = element.querySelector('.node-label');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + 4);
    
    // Update links connected to this node
    state.graphData.links.forEach((link, index) => {
      if (link.source === node.id || link.target === node.id) {
        const sourceNode = state.graphData.nodes.find(n => n.id === link.source);
        const targetNode = state.graphData.nodes.find(n => n.id === link.target);
        if (sourceNode && targetNode && link.element) {
          link.element.setAttribute('x1', sourceNode.x);
          link.element.setAttribute('y1', sourceNode.y);
          link.element.setAttribute('x2', targetNode.x);
          link.element.setAttribute('y2', targetNode.y);
        }
      }
    });
  }
  
  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    setTimeout(() => {
      selectedNode = null;
    }, 100);
  }
  
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

// Highlights nodes and links in the Graph visualizer and displays node description
function focusGraphNode(node) {
  const panel = document.getElementById('graph-node-info');
  
  // Reset all links and nodes first
  state.graphData.nodes.forEach(n => {
    if (n.element) n.element.classList.remove('active');
  });
  state.graphData.links.forEach(l => {
    if (l.element) l.element.classList.remove('active');
  });
  
  if (!node) {
    activeFocusedNode = null;
    panel.innerHTML = `
      <h3>Select a domain node</h3>
      <p>Click any node in the graph to see its system dependencies, linked agencies, and historical impact rules.</p>
    `;
    return;
  }
  
  activeFocusedNode = node.id;
  node.element.classList.add('active');
  
  // Highlight connected edges
  const connectedLinks = state.graphData.links.filter(l => l.source === node.id || l.target === node.id);
  connectedLinks.forEach(l => {
    l.element.classList.add('active');
    // Highlight sibling nodes as well
    const siblingId = l.source === node.id ? l.target : l.source;
    const sibling = state.graphData.nodes.find(n => n.id === siblingId);
    if (sibling) sibling.element.classList.add('active');
  });
  
  // Render descriptions based on domain
  let domainDescription = '';
  let linkedDomains = connectedLinks.map(l => l.source === node.id ? l.target : l.source).join(', ');
  
  switch(node.id) {
    case 'PHE':
      domainDescription = '<strong>PHE (Public Health Engineering / Jal Nigam):</strong> Manages clean water supply networks, pumping stations, and primary conduits. High spatial overlap with Sewerage, Storm Drains, and PWD roads.';
      break;
    case 'PWD':
      domainDescription = '<strong>PWD (Public Works Department):</strong> Road building and maintenance authority. Central node of the CDT. Digging requires road resurfacing. Enforces strict Lock-in periods post-restoration.';
      break;
    case 'DISCOM':
      domainDescription = '<strong>DISCOM (Electricity Distribution Co):</strong> Installs LT/HT cables, substations, and transformers. Trench sharing with BSNL fiber is common and highly cost-effective.';
      break;
    case 'BSNL':
      domainDescription = '<strong>Telecom (BSNL / Optical Fiber):</strong> Lays optical fiber lines. High risk of fiber cuts during PHE pipeline excavations. Benefit of joint trenches with DISCOM.';
      break;
    case 'GAIL':
      domainDescription = '<strong>GAIL (City Gas):</strong> High-pressure natural gas lines. Digging permit has extreme priority constraints. Close synchronization with fire department for emergency planning.';
      break;
    case 'HOSPITAL':
      domainDescription = '<strong>Critical Infrastructure (Hospitals):</strong> Accessibility must be preserved at all costs. Overlap checks raise high-risk alarms if a planned road closure blocks ambulance access paths.';
      break;
    case 'TRAFFIC':
      domainDescription = '<strong>Municipal Controls (Traffic Police):</strong> Coordinates route diversions, congestion prediction, and permits for heavy works on busy streets.';
      break;
    default:
      domainDescription = `<strong>${node.label}:</strong> Key urban agent node. Interdependent with other domains for unified municipality planning. Linked to: ${linkedDomains}.`;
  }
  
  panel.innerHTML = `
    <h3><i data-lucide="network"></i> ${node.label} Domain Selected</h3>
    <p>${domainDescription}</p>
  `;
  
  lucide.createIcons();
}

// Leaflet GIS Map Setup
let activeTileLayer = null;
let activeMarkers = [];

function initMap() {
  // Center map on Ujjain: [23.176, 75.788]
  map = L.map('map', {
    center: [23.178, 75.786],
    zoom: 14,
    zoomControl: false
  });
  
  L.control.zoom({ position: 'topleft' }).addTo(map);
  
  // Basemap definitions
  const basemaps = {
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    }),
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    })
  };

  // Add default layer (dark)
  activeTileLayer = basemaps.dark;
  activeTileLayer.addTo(map);

  // Basemap switcher listener
  document.getElementById('map-baselayer-select').addEventListener('change', (e) => {
    const selected = e.target.value;
    map.removeLayer(activeTileLayer);
    
    // Toggle invert filter on satellite maps
    const mapDiv = document.getElementById('map');
    if (selected === 'satellite' || selected === 'streets') {
      mapDiv.classList.add('map-no-invert');
    } else {
      mapDiv.classList.remove('map-no-invert');
    }

    activeTileLayer = basemaps[selected];
    activeTileLayer.addTo(map);
  });

  // Layer filter toggles listeners
  const filterToggles = ['normal', 'planned', 'digging', 'lockin'];
  filterToggles.forEach(layerName => {
    const el = document.getElementById(`toggle-layer-${layerName}`);
    if (el) {
      el.addEventListener('change', () => {
        renderRoadsOnMap();
      });
    }
  });

  // Quick focus buttons click handler
  document.querySelectorAll('.map-focus-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const roadId = btn.getAttribute('data-road');
      const road = state.roads.find(r => r.id === roadId);
      if (road) {
        // Build mock polyline for bounds calc
        const polyline = L.polyline(road.coordinates);
        map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 16 });
        
        // Open corresponding popup
        setTimeout(() => {
          if (roadLayers[road.id]) {
            roadLayers[road.id].openPopup();
          }
        }, 400);
      }
    });
  });

  renderRoadsOnMap();
}

function initHudControls() {
  const hud = document.getElementById('map-hud');
  const toggleBtn = document.getElementById('btn-toggle-hud');
  
  if (toggleBtn && hud) {
    // Click handler for toggle button
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHud();
    });

    // Let user click the entire collapsed circular HUD to expand it
    hud.addEventListener('click', () => {
      if (hud.classList.contains('collapsed')) {
        toggleHud();
      }
    });
  }
}

function toggleHud() {
  const hud = document.getElementById('map-hud');
  const toggleBtn = document.getElementById('btn-toggle-hud');
  if (!hud || !toggleBtn) return;

  const isCollapsed = hud.classList.toggle('collapsed');
  const icon = toggleBtn.querySelector('i');
  
  if (icon) {
    if (isCollapsed) {
      icon.setAttribute('data-lucide', 'sliders');
      toggleBtn.setAttribute('title', 'Maximize HUD');
    } else {
      icon.setAttribute('data-lucide', 'chevron-right');
      toggleBtn.setAttribute('title', 'Minimize HUD');
    }
    // Re-render Lucide icons
    lucide.createIcons();
  }
}

function renderRoadsOnMap() {
  // Clear existing polyline layers
  Object.keys(roadLayers).forEach(layerKey => {
    map.removeLayer(roadLayers[layerKey]);
  });
  roadLayers = {};
  
  // Clear active markers/beacons
  activeMarkers.forEach(m => map.removeLayer(m));
  activeMarkers = [];

  // Read toggle checkbox states (fallback to true if selectors missing)
  const showNormal = document.getElementById('toggle-layer-normal') ? document.getElementById('toggle-layer-normal').checked : true;
  const showPlanned = document.getElementById('toggle-layer-planned') ? document.getElementById('toggle-layer-planned').checked : true;
  const showDigging = document.getElementById('toggle-layer-digging') ? document.getElementById('toggle-layer-digging').checked : true;
  const showLockin = document.getElementById('toggle-layer-lockin') ? document.getElementById('toggle-layer-lockin').checked : true;

  state.roads.forEach(road => {
    // Check filters
    if (road.status === 'normal' && !showNormal) return;
    if (road.status === 'planned' && !showPlanned) return;
    if (road.status === 'digging' && !showDigging) return;
    if (road.status === 'lock-in' && !showLockin) return;

    let color = '#2ec4b6'; // normal
    let dash = null;
    
    if (road.status === 'lock-in') {
      color = '#e63946'; // red
    } else if (road.status === 'digging') {
      color = '#ff9933'; // orange
    } else if (road.status === 'planned') {
      color = '#ffb703'; // yellow
      dash = '6, 6';
    }
    
    // Draw Double Polyline for glowing neon visual effects
    // 1. Underlayer (glow aura)
    const glowLine = L.polyline(road.coordinates, {
      color: color,
      weight: 12,
      opacity: 0.16,
      dashArray: dash
    }).addTo(map);
    roadLayers[road.id + '-glow'] = glowLine;
    
    // 2. Toplayer (solid trench core)
    const polyline = L.polyline(road.coordinates, {
      color: color,
      weight: 4,
      opacity: 0.95,
      dashArray: dash
    }).addTo(map);
    roadLayers[road.id] = polyline;
    
    // Create popup HTML
    let popupHTML = `
      <div class="map-popup-card">
        <h3>${road.name}</h3>
        <p class="popup-status">Status: <strong style="color: ${color};">${road.status.toUpperCase()}</strong></p>
    `;
    
    if (road.status === 'lock-in') {
      popupHTML += `<p class="popup-lock">🔒 Excavation Lock-in Active until <strong>${road.lockinExpiry}</strong></p>`;
    } else if (road.status === 'digging') {
      const p = state.permits.find(perm => perm.roadId === road.id);
      popupHTML += `<p class="popup-desc">🏗️ Trench dug by: <strong>${p ? p.agency : 'Agency'}</strong></p>`;
      popupHTML += `<p class="popup-desc">Purpose: <em>${p ? p.purpose : 'Work'}</em></p>`;
      
      // Draw radar pulse beacon at starting coordinates
      const startCoord = road.coordinates[0];
      const activeIcon = L.divIcon({
        className: 'map-active-beacon',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      const beaconMarker = L.marker(startCoord, { icon: activeIcon }).addTo(map);
      beaconMarker.bindPopup(`<strong>Active Excavation Work</strong><br>${road.name}`);
      activeMarkers.push(beaconMarker);
      
    } else if (road.status === 'planned') {
      const p = state.permits.find(perm => perm.roadId === road.id);
      popupHTML += `
        <p class="popup-desc">📋 Proposal: <strong>${p ? p.agency : 'Agency'}</strong></p>
        <button class="btn btn-primary btn-small map-action-btn" onclick="appSwitchToTab('permits')">View Permits</button>
      `;
    } else {
      popupHTML += `
        <p class="popup-desc">Road is healthy with no pending projects.</p>
        <button class="btn btn-secondary btn-small map-action-btn" onclick="appOpenPermitModal('${road.id}')">Apply to Dig</button>
      `;
    }
    
    popupHTML += `</div>`;
    polyline.bindPopup(popupHTML);
  });
}

// Function triggered from Map popups
window.appSwitchToTab = function(tabId) {
  const btn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (btn) btn.click();
};

window.appOpenPermitModal = function(roadId) {
  openPermitModal(roadId);
};

// LLM Cognitive Chat Logic
function initChat() {
  const sendBtn = document.getElementById('chat-send-btn');
  const input = document.getElementById('chat-input-field');
  const clearBtn = document.getElementById('clear-chat-btn');
  
  sendBtn.addEventListener('click', () => submitChatQuery());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitChatQuery();
  });
  
  clearBtn.addEventListener('click', () => {
    state.chatHistory = [state.chatHistory[0]]; // keep welcome msg
    renderChatMessages();
  });
  
  // Wire suggested query clicks
  document.querySelectorAll('.suggested-query-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      input.value = query;
      submitChatQuery();
    });
  });
  
  renderChatMessages();
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages-container');
  container.innerHTML = '';
  
  state.chatHistory.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${msg.sender === 'user' ? 'user' : 'agent'}`;
    msgDiv.innerHTML = `
      <div class="msg-avatar">
        <i data-lucide="${msg.sender === 'user' ? 'user' : 'cpu'}"></i>
      </div>
      <div class="msg-bubble">${msg.text}</div>
    `;
    container.appendChild(msgDiv);
  });
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
  lucide.createIcons();
}

function submitChatQuery() {
  const input = document.getElementById('chat-input-field');
  const query = input.value.trim();
  
  if (!query) return;
  
  // Add user message
  state.chatHistory.push({ sender: 'user', text: query });
  renderChatMessages();
  input.value = '';
  
  // Animate CDT Ingest-to-Actuate pipeline
  runCognitivePipeline(query);
}

// 6-stage Cognitive Pipeline Animation & simulated Llama 3.1 + GraphRAG response
function runCognitivePipeline(query) {
  const tracker = document.getElementById('pipeline-tracker');
  tracker.classList.add('active');
  
  const steps = ['ingest', 'synchronize', 'simulate', 'predict', 'decide', 'actuate'];
  let currentStepIndex = 0;
  
  // Highlight graph focus when synchronizing
  let targetNodeForVisual = null;
  if (query.toUpperCase().includes('PHE')) targetNodeForVisual = 'PHE';
  else if (query.toUpperCase().includes('TELECOM') || query.toUpperCase().includes('FIBER') || query.toUpperCase().includes('BSNL')) targetNodeForVisual = 'BSNL';
  else if (query.toUpperCase().includes('GAS') || query.toUpperCase().includes('GAIL')) targetNodeForVisual = 'GAIL';
  else if (query.toUpperCase().includes('DISCOM') || query.toUpperCase().includes('ELECTRIC')) targetNodeForVisual = 'DISCOM';
  else if (query.toUpperCase().includes('PWD') || query.toUpperCase().includes('ROAD')) targetNodeForVisual = 'PWD';

  function processNextStep() {
    // Reset steps
    steps.forEach(s => {
      const el = tracker.querySelector(`[data-step="${s}"]`);
      el.classList.remove('active');
    });
    
    if (currentStepIndex > 0) {
      // Mark previous step as completed
      const prevStep = steps[currentStepIndex - 1];
      tracker.querySelector(`[data-step="${prevStep}"]`).classList.add('completed');
    }
    
    if (currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const el = tracker.querySelector(`[data-step="${currentStep}"]`);
      el.classList.add('active');
      
      // Perform cognitive visualization side-effects
      if (currentStep === 'synchronize' && targetNodeForVisual) {
        const node = state.graphData.nodes.find(n => n.id === targetNodeForVisual);
        if (node) focusGraphNode(node);
      }
      
      if (currentStep === 'simulate') {
        // Flash corresponding road on the map if it's in the query
        let roadId = 'road-freeganj';
        if (query.toUpperCase().includes('MAHAKAL')) roadId = 'road-mahakal';
        else if (query.toUpperCase().includes('DEWAS')) roadId = 'road-dewas';
        else if (query.toUpperCase().includes('HARIFATAK')) roadId = 'road-harifatak';
        
        const layer = roadLayers[roadId];
        if (layer) {
          let flashCount = 0;
          const flashInterval = setInterval(() => {
            if (flashCount % 2 === 0) layer.setStyle({ weight: 12, opacity: 1 });
            else layer.setStyle({ weight: 6, opacity: 0.8 });
            flashCount++;
            if (flashCount > 5) clearInterval(flashInterval);
          }, 150);
        }
      }
      
      currentStepIndex++;
      setTimeout(processNextStep, 700);
    } else {
      // Completed all steps! Post response.
      tracker.classList.remove('active');
      steps.forEach(s => {
        const el = tracker.querySelector(`[data-step="${s}"]`);
        el.classList.remove('completed', 'active');
      });
      
      executeChatResponse(query);
    }
  }
  
  processNextStep();
}

async function executeChatResponse(query) {
  if (state.backendLive) {
    try {
      const res = await fetch(`${state.backendUrl}/api/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      });
      if (res.ok) {
        const data = await res.json();
        state.chatHistory.push({ sender: 'agent', text: data.response });
        renderChatMessages();
        
        // Sync local variables since chat requests might mutate DB state in backend
        await syncDataFromBackend();
        initDashboard();
        return;
      }
    } catch (err) {
      console.error("Backend chat api query failed. Falling back to offline solver:", err);
    }
  }
  
  // Offline Mock generation logic
  generateSimulatedLlamaResponse(query);
}

function generateSimulatedLlamaResponse(query) {
  const normQuery = query.toLowerCase();
  let responseText = '';
  
  // Custom response matching
  if (normQuery.includes('mahakal') && normQuery.includes('phe')) {
    responseText = `
      <h3>Cognitive Analysis: PHE pipeline @ Mahakal Marg (Sept 2026)</h3>
      <p><strong>[1. INGEST]</strong> Digging application by PHE Jal Nigam for 600m water supply pipe installation analyzed.</p>
      <p><strong>[2. SYNCHRONIZE]</strong> Querying Neo4j Knowledge Graph. Main target node: <strong>PHE (Water)</strong>. Connected nodes: <strong>PWD (Roads)</strong>, <strong>DISCOM (Power)</strong>, <strong>BSNL (Telecom)</strong>, <strong>TRAFFIC</strong>, and <strong>HOSPITAL</strong>.</p>
      <p><strong>[3. SIMULATE]</strong> Cross-domain conflict detected. Mahakal Marg was reconstructed in June 2026. A <strong>24-Month Lock-in Period</strong> is active until June 2028 under PWD regulation.</p>
      <p><strong>[4. PREDICT (Ripple Effects):]</strong>
      <ul>
        <li><span style="color: #ff5a5f; font-weight:600;">PWD Violation:</span> Excavating a recently-restored road reduces structural life by 60%, costing the exchequer ₹12 Lakhs in pre-mature failure.</li>
        <li><span style="color: #ffb703; font-weight:600;">Critical Access Block:</span> Mahakal Road is the primary ambulance corridor for District Hospital. Digging will cause severe delay (est. +18 mins transport latency).</li>
        <li><span style="color: #ffb703; font-weight:600;">Socio-Religious Event Overlap:</span> Shravan Festival is active in August/September. Heavy pedestrian tourist flow makes digging unsafe.</li>
      </ul>
      </p>
      <p><strong>[5. DECIDE - Recommendation:]</strong>
      <span style="color: #ff5a5f; font-weight: 700;">PERMIT DENIED.</span> PHE is directed to reroute the pipeline layout through the parallel Triveni Road utility corridor, or defer the works until the lock-in restriction drops.
      </p>
      <p><strong>[6. ACTUATE]</strong> Notification dispatched to PWD Divisional Engineer and PHE Executive Engineer. Rerouting map draft queued in GIS portal.</p>
    `;
    
    // Add warning notification
    state.notifications.unshift({
      id: 'notif-' + Date.now(),
      type: 'error',
      text: 'PERMIT BLOCKED: PHE digging request on Mahakal Marg denied due to active Lock-in Period and hospital proximity.',
      time: 'Just now'
    });
    
  } else if (normQuery.includes('freeganj') && (normQuery.includes('telecom') || normQuery.includes('fiber') || normQuery.includes('bsnl'))) {
    responseText = `
      <h3>Cognitive Analysis: BSNL Telecom Fiber @ Freeganj Road (Oct 2026)</h3>
      <p><strong>[1. INGEST]</strong> Digging permit request from BSNL Telecom to lay optical fiber conduits on Freeganj Road in October 2026.</p>
      <p><strong>[2. SYNCHRONIZE]</strong> Knowledge Graph lookup: <strong>BSNL (Telecom)</strong>. Linked dependencies: <strong>PHE (Water)</strong>, <strong>DISCOM (Power)</strong>, and <strong>PWD (Roads)</strong>.</p>
      <p><strong>[3. SIMULATE]</strong> Overlap detected. PHE has submitted a planned permit (PM-PHE-901) for 400mm water pipe laying on Freeganj Road for September 2026. This falls within the coordination buffer window.</p>
      <p><strong>[4. PREDICT (Ripple Effects):]</strong>
      <ul>
        <li><span style="color: #ffb703; font-weight:600;">Repetitive Digging:</span> If dug separately, Freeganj road will be dug in Sept by PHE, restored, and dug again in Oct by BSNL, doubling citizen frustration and traffic blockage.</li>
        <li><span style="color: #2ec4b6; font-weight:600;">Cost Saving:</span> Standalone digging: PHE (₹8.5L) + BSNL (₹4.2L) = ₹12.7 Lakhs. Combined shared trench digging cost = ₹7.2 Lakhs.</li>
      </ul>
      </p>
      <p><strong>[5. DECIDE - Coordination Plan:]</strong>
      <span style="color: #2ec4b6; font-weight: 700;">JOINT PERMIT PROPOSED.</span> Enforce BSNL and PHE to coordinate. BSNL must lay fiber conduits simultaneously inside PHE's trench. Schedule set for Sept 10 - Sept 25. Cost split: PHE: 60%, BSNL: 40%.
      </p>
      <p><strong>[6. ACTUATE]</strong> Joint excavation proposal sent to BSNL and PHE coordinators. Added to **High-Priority Co-Digging Opportunities** on the Dashboard.</p>
    `;
    
    // Add opportunity
    const exists = state.coDigOpportunities.some(o => o.targetRoad === 'road-freeganj');
    if (!exists) {
      state.coDigOpportunities.push({
        id: 'opp-' + Date.now(),
        targetRoad: 'road-freeganj',
        roadName: 'Freeganj Main Road',
        leadAgency: 'PHE',
        leadPermitId: 'PM-PHE-901',
        proposedDates: 'Sep 10, 2026 - Sep 25, 2026',
        potentialPartner: 'Telecom (BSNL)',
        overlapReason: 'BSNL requested optical fiber routing in same zone within 30-day window.',
        estimatedSavings: 3.5
      });
      state.stats.activeCodig++;
      updateStats();
      renderOpportunities();
    }
    
    state.notifications.unshift({
      id: 'notif-' + Date.now(),
      type: 'warning',
      text: 'CO-DIG ALERT: Shared trench opportunity identified between PHE & BSNL on Freeganj Road.',
      time: 'Just now'
    });
    
  } else if (normQuery.includes('gail') || normQuery.includes('gas') || normQuery.includes('temple')) {
    responseText = `
      <h3>Cognitive Analysis: GAIL Gas Pipeline @ Temple Zone (July 2026)</h3>
      <p><strong>[1. INGEST]</strong> GAIL proposal for commercial gas supply pipelines in the Harifatak/Temple transition road network.</p>
      <p><strong>[2. SYNCHRONIZE]</strong> Knowledge Graph lookup: <strong>GAIL (Gas)</strong> ➔ <strong>FIRE</strong>, <strong>PWD</strong>, <strong>COMMERCIAL</strong>.</p>
      <p><strong>[3. SIMULATE]</strong> Road segment checks out as clear of lock-ins, but has an active coordination permit (PM-GAI-720) for July. Disaster Cell maps the zone as high pedestrian density.</p>
      <p><strong>[4. PREDICT (Ripple Effects):]</strong>
      <ul>
        <li><span style="color: #ff5a5f; font-weight:600;">Safety Hazard:</span> Open gas pipeline excavation near commercial shops requires secondary gas detection fire sensors.</li>
        <li><span style="color: #2ec4b6; font-weight:600;">Traffic Sync:</span> Overlaps with local market parking zones. Work must be limited to night shifts (11:00 PM to 5:00 AM) to maintain daytime market flow.</li>
      </ul>
      </p>
      <p><strong>[5. DECIDE - Actionable Plan:]</strong>
      <span style="color: #2ec4b6; font-weight:700;">PERMIT APPROVED WITH CONDITIONS.</span> Gas line trenching allowed on Harifatak Road. Compulsory overnight work mandate. Standard 20m safety block zones. DISCOM is notified to relocate overhead transformer during the same slot.
      </p>
      <p><strong>[6. ACTUATE]</strong> Overnight digging permit drafted. Fire safety clearance certificate request auto-triggered to Ujjain Fire Station.</p>
    `;
    
    state.notifications.unshift({
      id: 'notif-' + Date.now(),
      type: 'success',
      text: 'PERMIT APPROVED: GAIL gas line work on Harifatak road cleared under night-excavation mandate.',
      time: 'Just now'
    });
    
  } else {
    // Standard response for general queries
    responseText = `
      <h3>Cognitive Analysis: General Smart City Query</h3>
      <p><strong>[1. INGEST]</strong> Analysed query: <em>"${query}"</em>.</p>
      <p><strong>[2. SYNCHRONIZE]</strong> Resolved dependencies within the 20-domain urban Knowledge Graph. Central coordination nodes affected: <strong>PWD (Roads)</strong> and municipal utilities.</p>
      <p><strong>[3. SIMULATE]</strong> No major active project conflict or timeline overlap found for this custom query.</p>
      <p><strong>[4. PREDICT:]</strong> Conducting standard work without coordination will lead to fragmented assets. Setting up a joint trench reduces public disturbance by 40%.</p>
      <p><strong>[5. DECIDE:]</strong> Recommended to verify the exact road coordinate boundary in the <strong>Map & Knowledge Graph</strong> tab before submitting a formal permit request.</p>
      <p><strong>[6. ACTUATE]</strong> Portal remains ready. Submit a formal permit to generate a binding multi-agency synchronization offer.</p>
    `;
  }
  
  state.chatHistory.push({ sender: 'agent', text: responseText });
  renderChatMessages();
  
  // Refresh dashboard lists and badges because notifications/ops might have updated
  initDashboard();
}

// Permit Application Form & Conflict Detection Engine
function initPermitForm() {
  const triggerBtn = document.getElementById('trigger-permit-modal');
  const modal = document.getElementById('permit-modal');
  const closeBtn = document.getElementById('close-permit-modal');
  const cancelBtn = document.getElementById('cancel-permit');
  const form = document.getElementById('permit-form');
  const roadSelect = document.getElementById('permit-road');
  
  // Load roads dropdown options
  roadSelect.innerHTML = '';
  state.roads.forEach(road => {
    const opt = document.createElement('option');
    opt.value = road.id;
    opt.textContent = road.name;
    roadSelect.appendChild(opt);
  });

  // Modal show/hide
  triggerBtn.addEventListener('click', () => openPermitModal());
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
  
  // Realtime overlap and lock-in analysis in form
  roadSelect.addEventListener('change', () => runFormConflictAnalysis());
  document.getElementById('permit-start-date').addEventListener('change', () => runFormConflictAnalysis());
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitPermitForm();
  });
}

function openPermitModal(preselectedRoadId = null) {
  const modal = document.getElementById('permit-modal');
  const roadSelect = document.getElementById('permit-road');
  
  if (preselectedRoadId) {
    roadSelect.value = preselectedRoadId;
  }
  
  // Reset date and duration inputs
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('permit-start-date').value = today;
  document.getElementById('permit-duration').value = '15';
  document.getElementById('permit-purpose').value = '';
  
  modal.classList.add('active');
  runFormConflictAnalysis();
}

function runFormConflictAnalysis() {
  const roadId = document.getElementById('permit-road').value;
  const startDateStr = document.getElementById('permit-start-date').value;
  const conflictBox = document.getElementById('form-conflict-box');
  const title = document.getElementById('form-conflict-title');
  const desc = document.getElementById('form-conflict-desc');
  const submitBtn = document.getElementById('submit-permit-btn');
  
  const road = state.roads.find(r => r.id === roadId);
  
  if (!road) return;
  
  conflictBox.className = 'conflict-check-alert';
  submitBtn.disabled = false;
  submitBtn.textContent = "Run Cognitive Analysis & Submit";
  
  // Case 1: Road is under Lock-in period
  if (road.status === 'lock-in') {
    conflictBox.classList.add('danger');
    title.innerHTML = `<i data-lucide="shield-alert"></i> RESTRICTION ACTIVE: Excavation Prohibited`;
    desc.textContent = `This road was recently reconstructed. A strict lock-in is active until ${road.lockinExpiry}. Digging permits cannot be approved without high-level cabinet emergency clearance.`;
    submitBtn.disabled = true;
    submitBtn.textContent = "Permit Blocked by PWD Lock-in";
    lucide.createIcons();
    return;
  }
  
  // Case 2: Temporal overlap with an existing project on the same road
  const overlapPermit = state.permits.find(p => p.roadId === roadId);
  if (overlapPermit) {
    conflictBox.classList.add('warning');
    title.innerHTML = `<i data-lucide="users"></i> Co-Digging Opportunity Detected!`;
    desc.textContent = `Agency '${overlapPermit.agency}' has already planned digging on this road segment around this timeframe (Starting ${overlapPermit.startDate}). The CDT recommends merging this into a shared trench permit to save 40% construction costs.`;
    lucide.createIcons();
    return;
  }
  
  // Case 3: Clear
  conflictBox.classList.add('hidden');
}

async function submitPermitForm() {
  const modal = document.getElementById('permit-modal');
  const agency = document.getElementById('permit-agency').value;
  const roadId = document.getElementById('permit-road').value;
  const startDate = document.getElementById('permit-start-date').value;
  const duration = parseInt(document.getElementById('permit-duration').value);
  const purpose = document.getElementById('permit-purpose').value;
  
  const road = state.roads.find(r => r.id === roadId);
  
  // If backend is live, POST to backend FastAPI
  if (state.backendLive) {
    try {
      const res = await fetch(`${state.backendUrl}/api/permits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency, roadId, roadName: road.name, startDate, duration, purpose
        })
      });
      if (res.ok) {
        modal.classList.remove('active');
        state.notifications.unshift({
          id: 'notif-' + Date.now(),
          type: 'info',
          text: `NEW PROPOSAL SAVED TO NEO4J: ${agency} submitted digging request on ${road.name} for ${startDate}.`,
          time: 'Just now'
        });
        
        await syncDataFromBackend();
        initDashboard();
        renderPermitsTable();
        
        // Redirect to chat for What-if verification
        appSwitchToTab('cognitive-chat');
        const query = `What if ${agency} digs ${road.name.split('(')[0].trim()} in ${new Date(startDate).toLocaleString('default', { month: 'long' })}?`;
        document.getElementById('chat-input-field').value = query;
        submitChatQuery();
        return;
      } else {
        const errData = await res.json();
        alert(`Failed: ${errData.detail}`);
        return;
      }
    } catch (err) {
      console.error("Backend permit post failed. Falling back to offline permit submission:", err);
    }
  }

  // Offline Fallback
  const cost = parseFloat((5 + Math.random() * 8).toFixed(1)); // mock cost
  const newPermitId = 'PM-' + agency.substring(0,3).toUpperCase() + '-' + Math.floor(100 + Math.random()*900);
  const newPermit = {
    id: newPermitId,
    agency,
    roadId,
    roadName: road.name,
    startDate,
    duration,
    purpose,
    cost,
    status: 'Co-Digging Open',
    subscribers: []
  };
  
  state.permits.push(newPermit);
  
  // Set road status to planned and link permit
  road.status = 'planned';
  road.activePermits.push(newPermitId);
  
  // Add to notifications
  state.notifications.unshift({
    id: 'notif-' + Date.now(),
    type: 'info',
    text: `NEW PROPOSAL: ${agency} submitted digging request on ${road.name} for ${startDate}. Synchronizing graph...`,
    time: 'Just now'
  });
  
  // Close modal
  modal.classList.remove('active');
  
  // Update dashboard and map
  initDashboard();
  renderRoadsOnMap();
  renderPermitsTable();
  
  // Redirect to Cognitive Chat and run automatic coordination search
  appSwitchToTab('cognitive-chat');
  
  const query = `What if ${agency} digs ${road.name.split('(')[0].trim()} in ${new Date(startDate).toLocaleString('default', { month: 'long' })}?`;
  document.getElementById('chat-input-field').value = query;
  submitChatQuery();
}

// Rendering the coordination permits table in TAB 4
function renderPermitsTable() {
  const tableBody = document.getElementById('permits-table-body');
  const agencyFilter = document.getElementById('filter-agency').value;
  const statusFilter = document.getElementById('filter-status').value;
  
  tableBody.innerHTML = '';
  
  let filteredPermits = state.permits;
  
  if (agencyFilter !== 'all') {
    filteredPermits = filteredPermits.filter(p => p.agency === agencyFilter);
  }
  
  if (statusFilter !== 'all') {
    filteredPermits = filteredPermits.filter(p => {
      const isSynced = p.subscribers && p.subscribers.length > 0;
      if (statusFilter === 'Co-Digging Open') return p.status === 'Co-Digging Open';
      if (statusFilter === 'Co-Digging Synced') return isSynced;
      if (statusFilter === 'Digging Active') return p.status === 'Digging Active' || p.status === 'Active';
      return true;
    });
  }
  
  if (filteredPermits.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No permits matching the selected filters.</td></tr>`;
    return;
  }
  
  filteredPermits.forEach(p => {
    const isSynced = p.subscribers && p.subscribers.length > 0;
    
    let badgeClass = 'badge-info';
    if (p.status.includes('Active')) badgeClass = 'badge-danger';
    else if (isSynced) badgeClass = 'badge-success';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${p.id}</strong></td>
      <td><span class="agency-tag">${p.agency}</span></td>
      <td>${p.roadName}</td>
      <td>${p.startDate} (${p.duration} Days)</td>
      <td>${p.purpose}</td>
      <td>₹${p.cost.toFixed(1)} Lakhs</td>
      <td><span class="badge ${badgeClass}">${isSynced ? 'Synced w/ ' + p.subscribers.join(',') : p.status}</span></td>
      <td>
        ${p.status === 'Co-Digging Open' ? `
          <button class="btn btn-secondary btn-small sync-action-btn" data-permit-id="${p.id}">
            <i data-lucide="git-merge"></i> Sync Works
          </button>
        ` : `
          <span class="text-muted">In Progress</span>
        `}
      </td>
    `;
    
    const btn = row.querySelector('.sync-action-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        // Find opportunity corresponding to this road
        const opp = state.coDigOpportunities.find(o => o.leadPermitId === p.id);
        if (opp) {
          openAgreementModal(opp);
        } else {
          // Mock join if opportunity not registered
          openAgreementModal({
            id: 'mock-opp',
            targetRoad: p.roadId,
            roadName: p.roadName,
            leadAgency: p.agency,
            leadPermitId: p.id,
            proposedDates: `${p.startDate} - Duration ${p.duration} days`,
            potentialPartner: 'Telecom (BSNL)',
            overlapReason: 'BSNL requests shared trench layout to avoid road cuts.',
            estimatedSavings: p.cost * 0.4
          });
        }
      });
    }
    
    tableBody.appendChild(row);
  });
  
  lucide.createIcons();
}

// Wire filters inside permit table
document.getElementById('filter-agency').addEventListener('change', renderPermitsTable);
document.getElementById('filter-status').addEventListener('change', renderPermitsTable);

// Co-Digging Joint Agreement Modal logic
function initAgreementModal() {
  const modal = document.getElementById('agreement-modal');
  const closeBtn = document.getElementById('close-agreement-modal');
  const closeBtn2 = document.getElementById('close-agree-btn');
  const signBtn = document.getElementById('sign-agreement-btn');
  
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  closeBtn2.addEventListener('click', () => modal.classList.remove('active'));
  
  signBtn.addEventListener('click', async () => {
    // Action sign agreement
    const oppId = signBtn.getAttribute('data-opp-id');
    const permitId = signBtn.getAttribute('data-permit-id');
    const savings = parseFloat(signBtn.getAttribute('data-savings'));
    const partner = signBtn.getAttribute('data-partner');
    
    // If backend active, POST to coordinate endpoint
    if (state.backendLive) {
      try {
        const res = await fetch(`${state.backendUrl}/api/opportunities/coordinate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oppId, permitId, savings, partner
          })
        });
        if (res.ok) {
          state.notifications.unshift({
            id: 'notif-' + Date.now(),
            type: 'success',
            text: `CO-DIG AGREEMENT SIGNED (LIVE NEO4J): Synced excavation works on permit ${permitId}. Saved ₹${savings.toFixed(1)}L.`,
            time: 'Just now'
          });
          modal.classList.remove('active');
          
          await syncDataFromBackend();
          initDashboard();
          renderRoadsOnMap();
          renderPermitsTable();
          return;
        }
      } catch (err) {
        console.error("Backend coordinate post failed. Falling back to offline agreement signing:", err);
      }
    }

    // Offline logic
    const permit = state.permits.find(p => p.id === permitId);
    if (permit) {
      if (!permit.subscribers) permit.subscribers = [];
      permit.subscribers.push('BSNL');
      permit.status = 'Co-Digging Synced';
      
      // Update statistics
      state.stats.prevented++;
      state.stats.savings += savings;
      state.stats.activeCodig = state.permits.filter(p => p.subscribers && p.subscribers.length > 0).length;
      
      // Remove opportunity from list
      state.coDigOpportunities = state.coDigOpportunities.filter(o => o.id !== oppId);
      
      // Add notification
      state.notifications.unshift({
        id: 'notif-' + Date.now(),
        type: 'success',
        text: `CO-DIG AGREEMENT SIGNED: ${permit.agency} and BSNL joined excavation works on ${permit.roadName}. Estimated saving ₹${savings.toFixed(1)}L.`,
        time: 'Just now'
      });
      
      // Map road status update
      const road = state.roads.find(r => r.id === permit.roadId);
      if (road) {
        road.status = 'digging'; // shifts to digging sync mode
      }
      
      // Close modal
      modal.classList.remove('active');
      
      // Refresh
      initDashboard();
      renderRoadsOnMap();
      renderPermitsTable();
    }
  });
}

function openAgreementModal(opp) {
  const modal = document.getElementById('agreement-modal');
  
  document.getElementById('agree-road-name').textContent = opp.roadName;
  document.getElementById('agree-agency-1').textContent = opp.leadAgency;
  
  const partnerName = opp.potentialPartner.includes('(') 
    ? opp.potentialPartner.split('(')[1].replace(')', '') 
    : opp.potentialPartner;
    
  document.getElementById('agree-agency-2').textContent = partnerName;
  
  // Financial calculation based on lead agency costs
  const permit = state.permits.find(p => p.id === opp.leadPermitId);
  const primaryCost = permit ? permit.cost : opp.estimatedSavings * 2;
  const partnerCost = primaryCost * 0.55;
  const jointCost = (primaryCost + partnerCost) * 0.58; // trench overlap cost savings
  const savings = (primaryCost + partnerCost) - jointCost;
  
  document.getElementById('agree-cost-1').textContent = `₹${primaryCost.toFixed(2)} Lakhs`;
  document.getElementById('agree-cost-2').textContent = `₹${partnerCost.toFixed(2)} Lakhs`;
  document.getElementById('agree-joint-cost').textContent = `₹${jointCost.toFixed(2)} Lakhs`;
  document.getElementById('agree-savings').textContent = `₹${savings.toFixed(2)} Lakhs (${((savings/(primaryCost+partnerCost))*100).toFixed(0)}% Saved)`;
  
  // Customize timeline descriptions
  document.getElementById('agree-timeline-act1').textContent = `${opp.leadAgency} lays down pipelines/cables`;
  document.getElementById('agree-timeline-act2').textContent = `${partnerName} aligns fiber/duct installations`;
  
  // Set lock-in expiration date
  const lockDate = new Date();
  lockDate.setMonth(lockDate.getMonth() + 24);
  const formattedLockDate = lockDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById('agree-lock-date').textContent = formattedLockDate;
  
  // Attach data to button
  const signBtn = document.getElementById('sign-agreement-btn');
  signBtn.setAttribute('data-opp-id', opp.id);
  signBtn.setAttribute('data-permit-id', opp.leadPermitId);
  signBtn.setAttribute('data-savings', savings.toFixed(1));
  signBtn.setAttribute('data-partner', partnerName);
  
  modal.classList.add('active');
}

// Initial Permits Rendering
renderPermitsTable();
