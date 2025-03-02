document.addEventListener('DOMContentLoaded', function() {
  // Import psychographic display functions
  import('./psychographicDisplay.js')
    .then(module => {
      // Store the imported functions globally for use in animation loop
      window.psychographicModule = module;
      
      // Start initialization
      initializeInterface();
    })
    .catch(error => {
      console.error('Error loading psychographic display module:', error);
      // Continue with initialization even if module fails to load
      initializeInterface();
    });
});

// Main initialization function
function initializeInterface() {
  cacheElements();
  generateHexagonGrid();
  createATFieldBarriers();
  generateMeasurementScales();
  
  // Use the module function if available, otherwise fallback
  if (window.psychographicModule) {
    window.psychographicModule.setupPsychographicDisplay();
  }
  
  initDynamicGraphs();
  setupScrollingElements();
  updateSyncVisualization();
  updateTime();
  setInterval(flickerElements, 150);
  requestAnimationFrame(animationLoop);
}

// Global reference to make it accessible to imported modules
window.cachedElements = {};
window.elapsedTime = 0;

function cacheElements() {
  window.cachedElements.hexContainer = document.getElementById('hex-container');
  window.cachedElements.atFieldContainer = document.getElementById('at-field-container');
  window.cachedElements.syncVisualization = document.querySelector('.sync-visualization');
  window.cachedElements.timestamp = document.querySelector('.timestamp');
  window.cachedElements.psychoCanvas = null;
  window.cachedElements.syncBars = null;
  window.cachedElements.barriers = null;
  window.cachedElements.graphLines = [];
}

let lastFrameTime = 0;
let fpsThrottle = 0;

function animationLoop(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  window.elapsedTime += deltaTime;
  fpsThrottle++;
  if (fpsThrottle % 2 === 0) {
    updateGraphs(deltaTime);
  }
  
  // Run psychographic display update at full frame rate - no throttling
  // Use the module function if available, otherwise skip
  if (window.psychographicModule) {
    window.psychographicModule.updatePsychographicDisplay(deltaTime * 2);
  }
  
  if (fpsThrottle % 4 === 0) {
    updateATFieldBarriers(deltaTime);
  }
  if (fpsThrottle > 1000) fpsThrottle = 0;
  requestAnimationFrame(animationLoop);
}

function generateHexagonGrid() {
  // Disabled - no background hexagons
  return;
}

// Complete replacement for the AT Field barriers function
function createATFieldBarriers() {
  const container = document.getElementById('at-field-container');
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Load Honeycomb library via CDN if it's not already loaded
  if (!window.Honeycomb) {
    // Create a script tag to load the library
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/honeycomb-grid@3.1.8/dist/honeycomb.min.js';
    script.onload = initializeHexGrid; // Initialize after loading
    document.head.appendChild(script);
  } else {
    // If already loaded, initialize directly
    initializeHexGrid();
  }
  
  function initializeHexGrid() {
    // Container dimensions
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Barrier data
    const totalBarriers = 156;
    const integrity = 96.7;
    const failedCount = Math.floor(totalBarriers * (100 - integrity) / 100);
    
    // Failed indices
    const failedIndices = new Set();
    while (failedIndices.size < failedCount) {
      failedIndices.add(Math.floor(Math.random() * totalBarriers));
    }
    
    // Use Honeycomb library with optimized hexagon size
    const Hex = Honeycomb.extendHex({
      size: 20, // Slightly smaller to accommodate more columns
      orientation: 'flat'
    });
    
    const Grid = Honeycomb.defineGrid(Hex);
    
    // Get hex dimensions
    const hexWidth = Hex().width();
    const hexHeight = Hex().height();
    
    // Use 6 rows but increase to 26 columns (20 + 6 more)
    const rowCount = 6;
    const colCount = 26; // 6 rows × 26 columns = 156 hexagons (we'll limit to 80)
    
    // Adjust padding to account for more columns
    const padding = 5;
    
    // Create a grid with fixed size
    const hexes = Grid.rectangle({ width: colCount, height: rowCount });
    
    // Calculate actual grid dimensions
    const gridWidth = colCount * (hexWidth * 0.75) + (hexWidth * 0.25);
    const gridHeight = rowCount * hexHeight * 0.75 + (hexHeight * 0.25);
    
    // Adjust the vertical positioning to move grid up
    const leftOffset = Math.max(5, (width - gridWidth) / 2);
    const topOffset = (height - gridHeight) / 2 - 20; // Move up by 20px
    
    // Convert to array and limit to exactly 80 hexagons
    let hexArray = Array.from(hexes).slice(0, totalBarriers);
    
    // Create SVG namespace once
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Create hexagon elements
    hexArray.forEach((hex, index) => {
      // Get hex center point
      const point = hex.toPoint();
      
      // Get corners
      const corners = hex.corners();
      const cornersString = corners.map(({x, y}) => `${x},${y}`).join(' ');
      
      // Create SVG element
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", hexWidth);
      svg.setAttribute("height", hexHeight);
      svg.classList.add("at-barrier-svg");
      svg.style.position = "absolute";
      
      // Position with controlled offsets
      svg.style.left = `${point.x + leftOffset}px`;
      svg.style.top = `${point.y + topOffset}px`;
      
      // Set z-index for failed barriers
      if (failedIndices.has(index)) {
        svg.style.zIndex = "2";
      }
      
      // Create hexagon polygon
      const polygon = document.createElementNS(svgNS, "polygon");
      polygon.setAttribute("points", cornersString);
      polygon.classList.add("at-barrier");
      
      // Apply appropriate class
      if (failedIndices.has(index)) {
        polygon.classList.add("failed");
        
        // Add FAIL text
        const text = document.createElementNS(svgNS, "text");
        text.textContent = "FAIL";
        text.setAttribute("x", "50%");
        text.setAttribute("y", "50%");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.classList.add("fail-text");
        svg.appendChild(text);
      } else {
        polygon.classList.add("active");
      }
      
      svg.appendChild(polygon);
      container.appendChild(svg);
    });
    
    // Update display counts
    const countElement = document.getElementById('barrier-count');
    const integrityElement = document.getElementById('barrier-integrity');
    
    if (countElement) countElement.textContent = totalBarriers;
    if (integrityElement) integrityElement.textContent = integrity + "%";
  }
}

// Override any other AT field functions
function createATFieldGrid() {
  // Do nothing - this is superseded
}

function createHexagonGrid() {
  // Do nothing - this is superseded
}

// Ensure our function is called when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Call the AT field function directly
  setTimeout(createATFieldBarriers, 100); // Small delay to ensure container is ready
});

// Generate measurement scales with optimized DOM manipulation
function generateMeasurementScales() {
  const scales = document.querySelectorAll('.measurement-scale');
  
  scales.forEach(scale => {
    // Clear existing content
    scale.innerHTML = '';
    
    // Add proper margin
    scale.style.margin = '20px 40px';
    
    const width = scale.offsetWidth;
    const numMarkers = 20;
    const interval = width / numMarkers;
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i <= numMarkers; i++) {
      const marker = document.createElement('div');
      marker.className = 'scale-marker';
      marker.style.left = `${i * interval}px`;
      fragment.appendChild(marker);
      
      // Add value label every 5 markers (reduced DOM elements)
      if (i % 5 === 0) {
        const value = document.createElement('div');
        value.className = 'scale-value';
        value.textContent = `+${i * 5}`;
        value.style.left = `${i * interval}px`;
        fragment.appendChild(value);
      }
    }
    
    scale.appendChild(fragment);
  });
}

// Initialize dynamic graphs with optimized animation
function initDynamicGraphs() {
  // Setup both graphs
  setupDynamicGraph('.sync-graph-line', 'var(--eva-green)', 40);
  setupDynamicGraph('.at-graph-line', 'var(--eva-orange)', 60);
  
  // Cache graph lines for animation
  window.cachedElements.graphLines = document.querySelectorAll('.sync-graph-line, .at-graph-line');
}

function setupDynamicGraph(selector, color, baseline) {
  const graphLine = document.querySelector(selector);
  if (!graphLine) return;
  
  // Clear any existing points
  graphLine.setAttribute('points', '');
  
  // Generate initial points for the graph
  const points = generateGraphPoints(baseline);
  graphLine.setAttribute('points', points.join(' '));
  graphLine.setAttribute('stroke', color);
  
  // Store the baseline and points in the element for animation
  graphLine.dataset.baseline = baseline;
  graphLine.dataset.points = JSON.stringify(points);
  graphLine.dataset.lastUpdate = 0;
}

function generateGraphPoints(baseline) {
  const points = [];
  const segments = 10; // Reduced from 20
  
  for (let i = 0; i <= segments; i++) {
    const x = i * (200 / segments);
    
    // Generate a y value that fluctuates around the baseline
    const fluctuation = Math.random() * 30 - 15;
    const y = baseline + fluctuation;
    
    points.push(`${x},${y}`);
  }
  
  return points;
}

// Update graphs with optimized animation
function updateGraphs(deltaTime) {
  if (!window.cachedElements.graphLines) return;
  
  // Generate random fluctuation once per frame
  const globalFluctuation = Math.random() * 8 - 4;
  
  for (let i = 0; i < window.cachedElements.graphLines.length; i++) {
    const graphLine = window.cachedElements.graphLines[i];
    
    let currentPoints;
    try {
      currentPoints = JSON.parse(graphLine.dataset.points);
    } catch (e) {
      // If parsing fails, regenerate points
      const baseline = parseFloat(graphLine.dataset.baseline) || 40;
      currentPoints = generateGraphPoints(baseline);
    }
    
    // Shift only one point per frame (instead of all points)
    currentPoints.shift();
    
    const lastPoint = currentPoints[currentPoints.length - 1];
    const lastY = parseInt(lastPoint.split(',')[1]);
    
    // Use the global fluctuation for smoother animation
    const newY = Math.max(10, Math.min(80, lastY + globalFluctuation));
    
    currentPoints.push(`200,${newY}`);
    
    // Recalculate x coordinates
    const updatedPoints = currentPoints.map((point, index) => {
      const y = point.split(',')[1];
      return `${index * (200 / (currentPoints.length - 1))},${y}`;
    });
    
    // Update the graph
    graphLine.setAttribute('points', updatedPoints.join(' '));
    graphLine.dataset.points = JSON.stringify(updatedPoints);
  }
}

// Set up scrolling text elements with CSS-based animations where possible
function setupScrollingElements() {
  // Add scrolling text to MAGI system display
  const magiContainer = document.querySelector('.magi-display');
  if (magiContainer) {
    const scrollText = document.createElement('div');
    scrollText.className = 'scrolling-data';
    
    // Generate random data lines once
    let dataContent = '';
    for (let i = 0; i < 20; i++) {
      dataContent += `DATA LINE ${i.toString().padStart(3, '0')}: `;
      dataContent += `${Math.floor(Math.random() * 1000).toString().padStart(4, '0')} `;
      dataContent += `${Math.floor(Math.random() * 1000).toString().padStart(4, '0')} `;
      dataContent += `${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}<br>`;
    }
    
    scrollText.innerHTML = dataContent;
    magiContainer.appendChild(scrollText);
  }
  
  // Add scrolling text to terminal
  const terminal = document.querySelector('.terminal-prompt');
  if (terminal) {
    const commandsList = [
      'ANALYZE SPHERE COMPOSITION',
      'CALCULATE A.T. FIELD DENSITY',
      'MONITOR EVA SYNCHRONIZATION',
      'SCAN FOR PATTERN BLUE',
      'INITIATE EVANGELION LAUNCH SEQUENCE',
      'DEPLOY PROGRESSIVE KNIFE',
      'ACTIVATE DEFENSE SYSTEMS',
      'ACCESS MAGI DATABASE'
    ];
    
    // Set up terminal command cycling with longer intervals
    let commandIndex = 0;
    const command = terminal.querySelector('.terminal-command');
    
    if (command) {
      // Set up the interval with a longer delay
      setInterval(() => {
        // Fade out
        command.style.opacity = '0';
        
        setTimeout(() => {
          // Change text and fade in
          commandIndex = (commandIndex + 1) % commandsList.length;
          command.textContent = commandsList[commandIndex];
          command.style.opacity = '1';
        }, 500);
      }, 8000); // Increased from 5000ms to 8000ms
    }
  }
}

// Update the sync visualization with optimized DOM manipulation
function updateSyncVisualization() {
  const container = window.cachedElements.syncVisualization;
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Create a document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // Create green horizontal bars like in the reference image
  for (let i = 0; i < 5; i++) { // Reduced from 9 to 5
    const syncBar = document.createElement('div');
    syncBar.className = 'sync-bar';
    syncBar.style.top = `${15 + i * 20}px`; // Wider spacing
    
    // Add pulsing animation
    syncBar.dataset.pulseSpeed = 0.5 + Math.random();
    syncBar.dataset.baseOpacity = 0.7 + Math.random() * 0.3;
    
    fragment.appendChild(syncBar);
  }
  
  // Add vertical connectors at specific positions
  const connectorPositions = [0.3, 0.7]; // Reduced from 4 to 2
  
  connectorPositions.forEach(pos => {
    const connector = document.createElement('div');
    connector.className = 'sync-connector';
    connector.style.left = `${pos * 100}%`;
    fragment.appendChild(connector);
    
    // Add SYNC label
    const label = document.createElement('div');
    label.className = 'sync-label';
    label.textContent = 'SYNC';
    label.style.left = `${pos * 100}%`;
    fragment.appendChild(label);
  });
  
  container.appendChild(fragment);
  
  // Cache sync bars for animation
  window.cachedElements.syncBars = container.querySelectorAll('.sync-bar');
  
  // Initial animation call
  animateSyncBars();
}

// Animate the sync bars with pulsing, using cached elements
function animateSyncBars() {
  if (!window.cachedElements.syncBars) return;
  
  // Calculate one sin value for all bars
  const sinValue = Math.sin(window.elapsedTime / 1000);
  
  // Update all bars with the same calculation base
  for (let i = 0; i < window.cachedElements.syncBars.length; i++) {
    const bar = window.cachedElements.syncBars[i];
    const pulseSpeed = parseFloat(bar.dataset.pulseSpeed);
    const baseOpacity = parseFloat(bar.dataset.baseOpacity);
    
    // Calculate pulse value using the shared sin value
    const pulseValue = baseOpacity - (sinValue * pulseSpeed * 0.1);
    bar.style.opacity = pulseValue.toString();
  }
}

// Update time dynamically with reduced frequency of DOM updates
function updateTime() {
  // Check if the timestamp element exists
  if (!window.cachedElements.timestamp) return;
  
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  window.cachedElements.timestamp.textContent = `T-MINUS ${hours}:${minutes}:${seconds}`;
  
  // Add random flicker effect to some elements
  addRandomFlicker();
  
  setTimeout(updateTime, 1000);
}

// Add random flicker effect with reduced frequency
function addRandomFlicker() {
  // Use querySelectorAll less frequently by caching elements
  const neuralData = document.querySelectorAll('.neural-data, .neural-data-orange');
  
  // Reduce the number of elements that flicker each cycle
  for (let i = 0; i < Math.min(3, neuralData.length); i++) {
    const randIndex = Math.floor(Math.random() * neuralData.length);
    const element = neuralData[randIndex];
    
    if (Math.random() > 0.7) { // Reduced probability
      element.style.opacity = (0.3 + Math.random() * 0.7).toString();
      setTimeout(() => {
        element.style.opacity = '1';
      }, 50 + Math.random() * 200);
    }
  }
}

// Flicker additional UI elements with reduced frequency
function flickerElements() {
  // Use a single shared random value to reduce calculations
  const shouldFlicker = Math.random() > 0.85;
  const opacityValue = (0.4 + Math.random() * 0.6).toString();
  const resetDelay = 50 + Math.random() * 100;
  
  // 1. MAGI System display flicker - select only a couple of elements
  if (shouldFlicker) {
    const magiElements = document.querySelectorAll('.magi-circle, .magi-corner-box');
    const count = Math.min(2, magiElements.length);
    
    for (let i = 0; i < count; i++) {
      const randIndex = Math.floor(Math.random() * magiElements.length);
      const element = magiElements[randIndex];
      element.style.opacity = opacityValue;
      
      setTimeout(() => {
        element.style.opacity = '1';
      }, resetDelay);
    }
  }
  
  // 2. EVA Stats flicker - select only a couple of elements
  if (shouldFlicker) {
    const evaStats = document.querySelectorAll('.eva-status-item, .progress-fill, .penetration-data .eva-component');
    const count = Math.min(2, evaStats.length);
    
    for (let i = 0; i < count; i++) {
      const randIndex = Math.floor(Math.random() * evaStats.length);
      const element = evaStats[randIndex];
      element.style.opacity = opacityValue;
      
      setTimeout(() => {
        element.style.opacity = '1';
      }, resetDelay);
    }
  }
  
  // Occasionally flicker warning elements - select only one element
  if (shouldFlicker) {
    const warnings = document.querySelectorAll('.warning-box, .angel-alert, .deleted-text');
    if (warnings.length > 0) {
      const randIndex = Math.floor(Math.random() * warnings.length);
      const element = warnings[randIndex];
      element.style.opacity = opacityValue;
      
      setTimeout(() => {
        element.style.opacity = '1';
      }, resetDelay);
    }
  }
}

// Replace the animate function to disable circular animation
function updateATFieldBarriers() {
  // Disable all animations
  return;
}

// Function to create the NERV AT FIELD hexagon grid
function createNervATField() {
  const container = document.getElementById('nerv-at-field-container');
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Make sure Honeycomb library is loaded
  if (!window.Honeycomb) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/honeycomb-grid@3.1.8/dist/honeycomb.min.js';
    script.onload = initNervHexGrid;
    document.head.appendChild(script);
  } else {
    initNervHexGrid();
  }
  
  function initNervHexGrid() {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Use Honeycomb with larger hex size
    const Hex = Honeycomb.extendHex({
      size: 25, // Larger hexagons
      orientation: 'flat'
    });
    
    const Grid = Honeycomb.defineGrid(Hex);
    
    // Get hex dimensions
    const hexWidth = Hex().width();
    const hexHeight = Hex().height();
    
    // Calculate grid dimensions for larger hexagons
    const colCount = Math.ceil(width / (hexWidth * 0.75));
    const rowCount = Math.ceil(height / (hexHeight * 0.75));
    
    // Create a grid
    const hexes = Grid.rectangle({ width: colCount, height: rowCount });
    
    // Create SVG namespace once
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Create document fragment
    const fragment = document.createDocumentFragment();
    
    // Convert to array
    const hexArray = Array.from(hexes);
    
    // Create a pattern with intentional holes and clusters
    const displayedHexagons = new Set();
    
    // Create several clusters of hexagons with holes
    for (let cluster = 0; cluster < 5; cluster++) {
      // Random cluster center
      const centerX = Math.floor(Math.random() * colCount);
      const centerY = Math.floor(Math.random() * rowCount);
      
      // Create a cluster with some holes
      for (let y = -4; y <= 4; y++) {
        for (let x = -4; x <= 4; x++) {
          const posX = centerX + x;
          const posY = centerY + y;
          
          // Ensure in bounds
          if (posX >= 0 && posX < colCount && posY >= 0 && posY < rowCount) {
            // Create holes - skip some positions based on patterns
            if ((Math.abs(x) + Math.abs(y)) % 3 === 0 || Math.random() > 0.7) {
              continue; // Skip this position to create a hole
            }
            
            const hex = hexArray.find(h => h.x === posX && h.y === posY);
            if (hex) {
              displayedHexagons.add(hex);
            }
          }
        }
      }
    }
    
    // Add some connector hexagons between clusters
    hexArray.forEach(hex => {
      if (!displayedHexagons.has(hex) && Math.random() < 0.12) {
        displayedHexagons.add(hex);
      }
    });
    
    // Render hexagons with improved styling
    [...displayedHexagons].forEach(hex => {
      // Get hex center point
      const point = hex.toPoint();
      
      // Get corners
      const corners = hex.corners();
      const cornersString = corners.map(({x, y}) => `${x},${y}`).join(' ');
      
      // Create SVG element
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", hexWidth);
      svg.setAttribute("height", hexHeight);
      svg.classList.add("nerv-hex-svg");
      svg.style.position = "absolute";
      
      // Position hexagon
      svg.style.left = `${point.x}px`;
      svg.style.top = `${point.y}px`;
      
      // Create hexagon polygon
      const polygon = document.createElementNS(svgNS, "polygon");
      polygon.setAttribute("points", cornersString);
      polygon.classList.add("nerv-hex");
      
      // Brighter with less opacity variation for better visibility
      const opacity = 0.85 + Math.random() * 0.15;
      polygon.style.opacity = opacity.toString();
      
      svg.appendChild(polygon);
      fragment.appendChild(svg);
    });
    
    container.appendChild(fragment);
    
    // Enhanced flicker effect with less afterglow
    setInterval(() => {
      const hexElements = container.querySelectorAll('.nerv-hex');
      const animateCount = Math.ceil(hexElements.length * 0.15);
      
      for (let i = 0; i < animateCount; i++) {
        const randomIndex = Math.floor(Math.random() * hexElements.length);
        const element = hexElements[randomIndex];
        
        // Reduced dimming for less visual artifacts
        const currentOpacity = parseFloat(element.style.opacity || 1);
        element.style.opacity = (currentOpacity * 0.7).toString();
        
        setTimeout(() => {
          element.style.opacity = currentOpacity.toString();
        }, 80 + Math.random() * 200); // Shorter flicker time
      }
    }, 800);
  }
}

// Add to initialization function
document.addEventListener('DOMContentLoaded', function() {
  // Call the new NERV AT FIELD function
  setTimeout(createNervATField, 100);
}); 