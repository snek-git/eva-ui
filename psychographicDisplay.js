// Psychographic Display Module
// This module contains all the functions related to the EVA Psychographic Display

// Setup the psychographic display
function setupPsychographicDisplay() {
  // Get the lines container
  const container = document.querySelector('.psycho-lines');
  if (!container) return;
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Make container use full width with no constraints and add bottom padding
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'relative';
  container.style.paddingBottom = '30px'; // Add padding to ensure bottom scale is visible
  
  // Create a container for the entire display with proper layout
  const displayContainer = document.createElement('div');
  displayContainer.className = 'psycho-display-container';
  displayContainer.style.position = 'relative';
  displayContainer.style.width = '100%';
  displayContainer.style.height = '100%';
  
  // Add vertical grid lines first (behind everything)
  const gridLines = document.createElement('div');
  gridLines.className = 'psycho-grid-lines';
  gridLines.style.position = 'absolute';
  gridLines.style.width = '100%';
  gridLines.style.height = '100%';
  gridLines.style.top = '0';
  gridLines.style.left = '0';
  gridLines.style.zIndex = '1'; // Ensure it's behind the circuit paths
  
  // Add more vertical measurement lines (green lines going up)
  const verticalLinePositions = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
  
  verticalLinePositions.forEach(pos => {
    const line = document.createElement('div');
    line.className = 'psycho-vertical-line';
    line.style.position = 'absolute';
    line.style.top = '0';
    line.style.left = `${pos * 100}%`;
    line.style.width = '1px';
    line.style.height = '100%';
    line.style.backgroundColor = 'rgba(0, 255, 0, 0.9)';
    gridLines.appendChild(line);
  });
  
  displayContainer.appendChild(gridLines);
  
  // Create a single full-width canvas for the entire display
  const canvas = document.createElement('canvas');
  canvas.className = 'psycho-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '2'; // Ensure it's above grid lines
  
  // Set initial dimensions (will be updated after DOM is ready)
  canvas.width = container.offsetWidth || 600;
  canvas.height = container.offsetHeight || 300;
  
  displayContainer.appendChild(canvas);
  
  // Add crosshairs - evenly distributed, simple green + signs
  const crosshairsContainer = document.createElement('div');
  crosshairsContainer.className = 'psycho-crosshairs';
  crosshairsContainer.style.position = 'absolute';
  crosshairsContainer.style.top = '0';
  crosshairsContainer.style.left = '0';
  crosshairsContainer.style.width = '100%';
  crosshairsContainer.style.height = '100%';
  crosshairsContainer.style.zIndex = '3'; // Above canvas elements
  
  // Create a perfect grid of crosshairs (5x4 grid = 20 crosshairs)
  const crosshairRows = 4;
  const crosshairCols = 5;
  
  for (let y = 0; y < crosshairRows; y++) {
    for (let x = 0; x < crosshairCols; x++) {
      const crosshair = document.createElement('div');
      crosshair.className = 'psycho-crosshair';
      crosshair.style.position = 'absolute';
      
      // Calculate exact percentage positions for perfect alignment
      crosshair.style.top = `${(y + 0.5) * (100 / crosshairRows)}%`;
      crosshair.style.left = `${(x + 0.5) * (100 / crosshairCols)}%`;
      
      crosshair.innerHTML = '+';
      crosshair.style.color = 'rgba(0, 255, 0, 0.9)';
      crosshair.style.fontSize = '20px';
      crosshair.style.opacity = '0.8';
      crosshairsContainer.appendChild(crosshair);
    }
  }
  
  displayContainer.appendChild(crosshairsContainer);
  
  // We'll now rely entirely on canvas for the bottom scale rather than HTML elements
  // Remove DOM-based scale markers to prevent duplication
  
  container.appendChild(displayContainer);
  
  // Cache the canvas element
  window.cachedElements.psychoCanvas = canvas;
  
  // Initialize the canvas with correct dimensions after DOM is ready
  setTimeout(() => {
    if (canvas.offsetWidth && canvas.offsetHeight) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Initial draw
      drawPsychoCanvas(canvas);
    }
  }, 0);
}

// Draw the psychographic display with all elements on canvas
function drawPsychoCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Get time value for animation (or use 0 if not set)
  const time = canvas.timeOffset || 0;
  
  // Define colors
  const ORANGE_COLOR = 'rgba(255, 165, 0, 0.9)';
  
  // Draw with orange color
  ctx.strokeStyle = ORANGE_COLOR;
  ctx.lineWidth = 1.5;
  
  // Define dimensions for the neural box in the middle - making it narrower
  // Making it even less wide as requested - keeping it roughly between green lines
  const neuralBoxLeft = width * 0.35; // Narrower (was 0.32)
  const neuralBoxRight = width * 0.65; // Narrower (was 0.68)
  const neuralBoxWidth = neuralBoxRight - neuralBoxLeft;
  
  // Adjust the height to leave more room at the bottom for the scale
  const neuralBoxTop = height * 0.12;
  const neuralBoxHeight = height * 0.66; // Reduced from 0.76 to leave more room at bottom
  const neuralBoxBottom = neuralBoxTop + neuralBoxHeight;
  const neuralBoxMiddleY = neuralBoxTop + (neuralBoxHeight / 2);
  
  // Random jumps - occasionally teleport connection points to new positions
  const jumpChance = 0.15; // 15% chance of a jump per frame
  const hasJumpLeft = Math.random() < jumpChance;
  const hasJumpRight = Math.random() < jumpChance;
  
  // Store the jump state so we can use it when drawing branches
  canvas.hasJumpLeft = hasJumpLeft;
  canvas.hasJumpRight = hasJumpRight;
  
  // Left connection point with occasional jumps
  const leftConnectionX = neuralBoxLeft + (neuralBoxWidth * (0.1 + Math.random() * 0.2)) + 
                         (hasJumpLeft ? (Math.random() * 40 - 20) : 0);
  const leftConnectionY = neuralBoxMiddleY + (Math.sin(time * 1.2) * height * 0.1) 
                          + (Math.random() * 25 - 12.5) 
                          + Math.cos(time * 0.7) * 8
                          + (hasJumpLeft ? (Math.random() * 70 - 35) : 0); // Large jump when triggered
  
  // Right connection point with occasional jumps
  const rightConnectionX = neuralBoxRight - (neuralBoxWidth * (0.1 + Math.random() * 0.2)) +
                          (hasJumpRight ? (Math.random() * 40 - 20) : 0);
  const rightConnectionY = neuralBoxMiddleY - (Math.sin(time * 0.9) * height * 0.1) 
                           + (Math.random() * 30 - 15)
                           + Math.sin(time * 1.3) * 12
                           + (hasJumpRight ? (Math.random() * 70 - 35) : 0); // Large jump when triggered
  
  // Define external connection points 30px outside the neural box
  const leftExternalX = neuralBoxLeft - 30;
  // Make the right end of the left curve higher as requested
  const fixedMiddleY = height * 0.4; // Higher (was 0.45)
  
  // Add random jumps to external points too
  const jumpChanceExternal = 0.1; // 10% chance per frame
  const hasJumpLeftExt = Math.random() < jumpChanceExternal;
  const hasJumpRightExt = Math.random() < jumpChanceExternal;
  
  // Add animation to the left external point (similar to right side)
  const leftExternalY = fixedMiddleY 
                     + Math.sin(time * 1.4) * 12  // Faster frequency
                     + Math.cos(time * 2.1) * 6   // Even faster secondary movement
                     + (Math.random() * 5 - 2.5)  // Small random jitter
                     + (hasJumpLeftExt ? (Math.random() * 50 - 25) : 0); // Occasional jump
                     
  const rightExternalX = neuralBoxRight + 30;
  
  // Add animation to the external connection point for the right circuit
  const rightExternalY = fixedMiddleY 
                      + Math.sin(time * 1.7) * 10     // Different frequency from left
                      + Math.cos(time * 0.9) * 8      // Different secondary pattern 
                      + Math.sin(time * 3.3) * 4      // Extra high-frequency jitter
                      + (Math.random() * 6 - 3)       // Random jitter component
                      + (hasJumpRightExt ? (Math.random() * 50 - 25) : 0); // Occasional jump
  
  // Store these dimensions on the canvas for animation
  canvas.neuralBoxLeft = neuralBoxLeft;
  canvas.neuralBoxRight = neuralBoxRight;
  canvas.neuralBoxMiddleY = neuralBoxMiddleY;
  canvas.leftConnectionX = leftConnectionX;
  canvas.leftConnectionY = leftConnectionY;
  canvas.rightConnectionX = rightConnectionX;
  canvas.rightConnectionY = rightConnectionY;
  canvas.leftExternalX = leftExternalX;
  canvas.leftExternalY = leftExternalY;
  canvas.rightExternalX = rightExternalX;
  canvas.rightExternalY = rightExternalY;
  
  // 1. First draw left circuit line - a completely static smooth curve from bottom left to left external point
  // Making it more concave as requested
  ctx.beginPath();
  ctx.strokeStyle = ORANGE_COLOR;
  ctx.lineWidth = 1.5;
  
  // Start from bottom left
  const startX = 0;
  const startY = height * 0.7; // Start from lower position
  ctx.moveTo(startX, startY);
  
  // Create an intermediate point for the curve to flow through
  // This will make it look less like a single rope and more like a natural curve
  const midPointX = width * 0.25;
  const midPointY = height * 0.65 + Math.sin(time * 1.2) * 15 + (Math.random() * 10 - 5);
  
  // First bezier curve segment - from start to mid point
  const firstCp1x = width * 0.1;
  const firstCp1y = height * 0.85 + (Math.random() * 8 - 4);
  const firstCp2x = midPointX - width * 0.05 + Math.sin(time * 1.4) * 3;
  const firstCp2y = midPointY + height * 0.1 + Math.cos(time * 1.7) * 5;
  
  // Second bezier curve segment - from mid point to external point
  const secondCp1x = midPointX + width * 0.05 + Math.sin(time * 1.6) * 4;
  const secondCp1y = midPointY - height * 0.15 + Math.cos(time * 1.9) * 8;
  const secondCp2x = leftExternalX - width * 0.08 + Math.sin(time * 2.1) * 6;
  const secondCp2y = leftExternalY + height * 0.1 + Math.cos(time * 1.3) * 7;
  
  // Draw first segment (start to midpoint)
  ctx.bezierCurveTo(firstCp1x, firstCp1y, firstCp2x, firstCp2y, midPointX, midPointY);
  
  // Draw second segment (midpoint to external point)
  ctx.bezierCurveTo(secondCp1x, secondCp1y, secondCp2x, secondCp2y, leftExternalX, leftExternalY);
  
  ctx.stroke();
  
  // Now draw the connection from external point to the internal connection point
  ctx.beginPath();
  // Create dynamic bezier curve for this connection
  const leftConnCp1x = leftExternalX + (leftConnectionX - leftExternalX) * 0.3 
                   + Math.sin(time * 1.6) * 9
                   + (Math.random() * 6 - 3); // Add jitter
  const leftConnCp1y = leftExternalY + (leftConnectionY - leftExternalY) * 0.3 
                   + Math.cos(time * 2.2) * 8
                   + (Math.random() * 5 - 2.5); // Add jitter
  const leftConnCp2x = leftExternalX + (leftConnectionX - leftExternalX) * 0.7 
                   + Math.sin(time * 1.9) * 7
                   + (Math.random() * 4 - 2); // Add jitter
  const leftConnCp2y = leftExternalY + (leftConnectionY - leftExternalY) * 0.7 
                   + Math.cos(time * 1.7) * 9
                   + (Math.random() * 5 - 2.5); // Add jitter
  
  ctx.moveTo(leftExternalX, leftExternalY);
  ctx.bezierCurveTo(leftConnCp1x, leftConnCp1y, leftConnCp2x, leftConnCp2y, leftConnectionX, leftConnectionY);
  ctx.stroke();
  
  // 2. Draw the chaotic pattern in the middle neural box
  // But first, let's ensure we have connection points ready for the left and right circuits
  drawChaoticPattern(ctx, neuralBoxLeft, neuralBoxTop, neuralBoxWidth, neuralBoxHeight, time, 
                  leftConnectionX, leftConnectionY, rightConnectionX, rightConnectionY);
  
  // 3. Draw right circuit line - with complex pattern as requested
  // First draw a direct straight line from the internal connection point to the external point
  ctx.beginPath();
  ctx.strokeStyle = ORANGE_COLOR;
  ctx.lineWidth = 1.5;
  
  // Start from the internal connection point inside the neural box
  ctx.moveTo(rightConnectionX, rightConnectionY);
  
  // Create a dynamic path from chaotic pattern to external point
  // Instead of static straight line, make this curve and animate
  const connCp1x = rightConnectionX + (rightExternalX - rightConnectionX) * 0.3 
                + Math.sin(time * 2.0) * 8
                + Math.cos(time * 1.3) * 6
                + (Math.random() * 10 - 5); // More extreme random jitter
  const connCp1y = rightConnectionY + (rightExternalY - rightConnectionY) * 0.3 
                + Math.cos(time * 1.8) * 7
                + Math.sin(time * 3.0) * 5  // High frequency component
                + (Math.random() * 8 - 4);
  const connCp2x = rightConnectionX + (rightExternalX - rightConnectionX) * 0.7 
                + Math.sin(time * 1.5) * 9
                - Math.cos(time * 2.5) * 5  // Subtraction creates different pattern
                + (Math.random() * 7 - 3.5);
  const connCp2y = rightConnectionY + (rightExternalY - rightConnectionY) * 0.7 
                + Math.sin(time * 2.2) * 7
                + Math.cos(time * 1.4) * 8
                + (Math.random() * 9 - 4.5);
  
  // Draw a bezier curve to external point for a more dynamic connection
  ctx.bezierCurveTo(connCp1x, connCp1y, connCp2x, connCp2y, rightExternalX, rightExternalY);
  
  // Now draw the complex right pattern with staircases and EKG patterns
  // IMPORTANT: DO NOT create a new path - continue from the current path
  // Create a rightConnection object to match the provided code structure
  const rightConnection = {
    x: rightExternalX,
    y: rightExternalY
  };
  
  // Generate points for a pattern that moves across screen
  // Instead of uniform segments, we'll create a more random progression
  const totalWidth = width * 0.95 - rightConnection.x;
  const totalHeight = (height - 60) - rightConnection.y;
  
  // Create a more random number of segments (between 7-12)
  const segments = 7 + Math.floor(Math.random() * 6);
  
  // Track how much width and height we've used
  let usedWidth = 0;
  let usedHeight = 0;
  
  // Instead of uniform segments, create random sizes that sum to the total
  const segmentWidths = [];
  const segmentHeights = [];
  
  // Generate random segment widths
  for (let i = 0; i < segments; i++) {
    // More variance in segment width (0.5 to 1.5 of average)
    const widthFactor = 0.5 + Math.random() * 1.0;
    const heightFactor = 0.5 + Math.random() * 1.0;
    
    segmentWidths.push(widthFactor);
    segmentHeights.push(heightFactor);
    
    usedWidth += widthFactor;
    usedHeight += heightFactor;
  }
  
  // Normalize to ensure total width and height are maintained
  for (let i = 0; i < segments; i++) {
    segmentWidths[i] = (segmentWidths[i] / usedWidth) * totalWidth;
    segmentHeights[i] = (segmentHeights[i] / usedHeight) * totalHeight;
  }
  
  // Randomize which segment has an outburst (create an array of true/false values)
  const outburstSegments = [];
  for (let i = 0; i < segments; i++) {
    // More random probability per segment, between 10-40%
    const outburstChance = 0.1 + Math.random() * 0.3;
    outburstSegments.push(Math.random() < outburstChance);
  }
  
  // Make sure we have at least 2 outbursts
  let outburstCount = outburstSegments.filter(x => x).length;
  if (outburstCount < 2) {
    // Force at least 2 random segments to have outbursts
    while (outburstCount < 2) {
      const idx = Math.floor(Math.random() * segments);
      if (!outburstSegments[idx]) {
        outburstSegments[idx] = true;
        outburstCount++;
      }
    }
  }
  
  // Current position after the initial curved connection
  let currentX = rightConnection.x;
  let currentY = rightConnection.y;

  for (let i = 0; i < segments; i++) {
    // Get this segment's width and height
    const segmentWidth = segmentWidths[i];
    const segmentHeight = segmentHeights[i];
    
    // Check if this segment should have an outburst
    const outburst = outburstSegments[i];
    
    if (!outburst) {
      // Normal staircase step - but with more randomness
      // Sometimes add slight jitter to make it less uniform
      const jitterX = Math.random() > 0.7 ? (Math.random() * 8 - 4) : 0;
      const jitterY = Math.random() > 0.7 ? (Math.random() * 8 - 4) : 0;
      
      // Horizontal segment (sometimes with slight slope)
      const slope = Math.random() > 0.7 ? (Math.random() * 10 - 5) : 0;
      const nextX = currentX + segmentWidth + jitterX;
      const midY = currentY + slope;
      ctx.lineTo(nextX, midY);
      
      // Vertical segment (sometimes with slight curve)
      const curve = Math.random() > 0.7;
      if (curve) {
        // Add a slight curve instead of straight line
        const cpX = nextX + (Math.random() * 20 - 10);
        const nextY = midY + segmentHeight + jitterY;
        ctx.quadraticCurveTo(cpX, (midY + nextY) / 2, nextX, nextY);
        currentY = nextY;
      } else {
        // Straight vertical segment
        currentY = midY + segmentHeight + jitterY;
        ctx.lineTo(nextX, currentY);
      }
      
      // Occasionally add a small loop to normal segments too (not just outbursts)
      if (Math.random() < 0.15) {
        // Add a small decorative loop or arc without breaking the path
        const loopSize = 5 + Math.random() * 10;
        const loopX = nextX - loopSize/2;
        const loopY = currentY - loopSize/2;
        const startAngle = Math.random() * Math.PI;
        const endAngle = startAngle + Math.PI * (0.5 + Math.random() * 1.0);  // Never a full circle
        
        // Draw the loop as a partial arc, never a complete circle
        // Move to the point on the circle where the arc will start
        const startPointX = loopX + loopSize * Math.cos(startAngle);
        const startPointY = loopY + loopSize * Math.sin(startAngle);
        
        // First lineTo the start of the arc to maintain continuity
        ctx.lineTo(startPointX, startPointY);
        
        // Then draw the arc
        ctx.arc(loopX, loopY, loopSize, startAngle, endAngle);
        
        // Line back to the main path continuation point
        ctx.lineTo(nextX, currentY);
      }
      
      currentX = nextX;
    } else {
      // Complex EKG outburst - wider variation in width and complexity
      const burstWidth = segmentWidth * (0.8 + Math.random() * 1.2); // 80-200% of segment width
      const startX = currentX;
      const startY = currentY;
      
      // Choose a random outburst pattern with purely random choice
      const patternIndex = Math.floor(Math.random() * 4); // Now 4 possible patterns
      
      if (patternIndex === 0) {
        // Sine wave pattern - more variety in cycles and amplitude
        const cycles = 0.5 + Math.random() * 3; // Can be partial cycle now
        const amplitude = 10 + Math.random() * 40; // More variety in height
        
        // Random number of points to make the sine wave less uniform
        const points = 10 + Math.floor(Math.random() * 20);
        
        for (let j = 0; j <= points; j++) {
          const x = startX + (j/points) * burstWidth;
          // Add slight noise to make the sine wave less perfect
          const noise = Math.random() * 5 - 2.5;
          const y = startY + Math.sin((j/points) * Math.PI * 2 * cycles) * amplitude + noise;
          ctx.lineTo(x, y);
          
          // Add occasional small loops along the sine wave
          if (Math.random() < 0.07 && j > 0 && j < points-1) {
            const loopX = x;
            const loopY = y;
            const loopSize = 3 + Math.random() * 8;
            
            // Draw partial arc/loop (never complete circle)
            const startAngle = Math.random() * Math.PI;
            const arcLength = Math.PI * (0.3 + Math.random() * 1.2); // Varies from 30% to 150% of π
            const endAngle = startAngle + arcLength;
            
            // Calculate the start point of the arc to maintain continuity
            const arcStartX = loopX + loopSize * Math.cos(startAngle);
            const arcStartY = loopY + loopSize * Math.sin(startAngle);
            
            // Make sure we're at the start point of the arc
            ctx.lineTo(arcStartX, arcStartY);
            
            // Then draw the arc
            ctx.arc(loopX, loopY, loopSize, startAngle, endAngle);
            
            // Continue from the end point of the arc
            const arcEndX = loopX + loopSize * Math.cos(endAngle);
            const arcEndY = loopY + loopSize * Math.sin(endAngle);
            
            // Line back to the original path to continue the sine wave
            ctx.lineTo(x, y);
          }
        }
      } else if (patternIndex === 1) {
        // Square wave pattern - now more horizontal/sideways as requested
        const steps = 2 + Math.floor(Math.random() * 4);
        const stepWidth = burstWidth / steps;
        
        // Make horizontal parts longer than vertical for a more sideways appearance
        const verticalScale = 0.4 + Math.random() * 0.6; // Reduce vertical height (40-100% of original)
        
        for (let j = 0; j < steps; j++) {
          // Different height for each step, but scaled down to be more horizontal
          const height = (10 + Math.random() * 30) * verticalScale;
          
          // Make square wave go both above and below the center line for balance
          const direction = (Math.random() > 0.5) ? 1 : -1; 
          
          // First horizontal segment (longer)
          ctx.lineTo(startX + j * stepWidth + (stepWidth * 0.4), startY);
          
          // Vertical segment (shorter) with slight jitter
          const jitter = Math.random() * 4 - 2;
          ctx.lineTo(startX + j * stepWidth + (stepWidth * 0.4), startY + (direction * height) + jitter);
          
          // Second horizontal segment (longer)
          ctx.lineTo(startX + (j+1) * stepWidth, startY + (direction * height) + jitter);
          
          // Vertical back to baseline with slight jitter
          const jitter2 = Math.random() * 4 - 2;
          ctx.lineTo(startX + (j+1) * stepWidth, startY + jitter2);
          
          // Add occasional small loop at corners (25% chance at each corner)
          if (Math.random() < 0.25) {
            const cornerX = startX + (j+1) * stepWidth;
            const cornerY = startY + jitter2;
            const loopSize = 2 + Math.random() * 6;
            
            // Draw partial arc (never complete circle)
            const startAngle = Math.random() * Math.PI;
            const endAngle = startAngle + Math.PI * (0.5 + Math.random() * 0.8);
            
            // Calculate the start point of the arc to maintain continuity
            const arcStartX = cornerX + loopSize * Math.cos(startAngle);
            const arcStartY = cornerY + loopSize * Math.sin(startAngle);
            
            // Make sure we're at the start point of the arc
            ctx.lineTo(arcStartX, arcStartY);
            
            // Then draw the arc
            ctx.arc(cornerX, cornerY, loopSize, startAngle, endAngle);
            
            // Line back to continue from the corner
            ctx.lineTo(cornerX, cornerY);
          }
        }
        
        // Finish at approximately the same height we started
        ctx.lineTo(startX + burstWidth, startY + (Math.random() * 6 - 3));
      } else if (patternIndex === 2) {
        // Curved burst with loops - more random control points
        const burstCp1x = startX + burstWidth * (0.2 + Math.random() * 0.3);
        const burstCp1y = startY - (10 + Math.random() * 60);
        const burstCp2x = startX + burstWidth * (0.6 + Math.random() * 0.3);
        const burstCp2y = startY + (10 + Math.random() * 60);
        
        // Main curve
        ctx.bezierCurveTo(burstCp1x, burstCp1y, burstCp2x, burstCp2y, startX + burstWidth, startY);
        
        // Add loops as decorative elements that don't break the path
        const loopCount = 2 + Math.floor(Math.random() * 4);
        for (let l = 0; l < loopCount; l++) {
          // Place loop at random position
          const loopX = startX + burstWidth * Math.random();
          const loopY = startY + (Math.random() * 80 - 40);
          const loopRadius = 3 + Math.random() * 12;
          
          // Create partial arcs instead of complete circles
          const startAngle = Math.random() * Math.PI * 2;
          const endAngle = startAngle + Math.PI * (0.5 + Math.random() * 1.2); // 90-270 degrees
          
          // Move to loop position and add the loop as decoration
          ctx.lineTo(loopX + loopRadius * Math.cos(startAngle), loopY + loopRadius * Math.sin(startAngle));
          ctx.arc(loopX, loopY, loopRadius, startAngle, endAngle);
          
          // Return to the main path
          ctx.lineTo(startX + burstWidth, startY);
        }
      } else {
        // Enhanced zigzag with loops and curved connections
        const zigzags = 3 + Math.floor(Math.random() * 5);
        const zigWidth = burstWidth / zigzags;
        
        for (let z = 0; z < zigzags; z++) {
          // Random height for each zigzag
          const zigHeight = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 30);
          
          // Use curves instead of straight lines for more organic feel
          if (Math.random() > 0.4) {
            // Curved zigzag
            const cpX1 = startX + (z * zigWidth) + (zigWidth * 0.25);
            const cpY1 = startY + (zigHeight * 0.8);
            const midX = startX + ((z + 0.5) * zigWidth);
            const midY = startY + zigHeight;
            
            ctx.quadraticCurveTo(cpX1, cpY1, midX, midY);
            
            const cpX2 = startX + ((z + 0.5) * zigWidth) + (zigWidth * 0.25);
            const cpY2 = startY + zigHeight;
            const endX = startX + ((z + 1) * zigWidth);
            const endY = startY;
            
            ctx.quadraticCurveTo(cpX2, cpY2, endX, endY);
          } else {
            // Standard zigzag with slight jitter
            const jitter = Math.random() * 6 - 3;
            ctx.lineTo(startX + ((z + 0.5) * zigWidth), startY + zigHeight + jitter);
            ctx.lineTo(startX + ((z + 1) * zigWidth), startY);
          }
          
          // Add decorative loops on some peaks (20% chance)
          if (Math.random() < 0.2) {
            const peakX = startX + ((z + 0.5) * zigWidth);
            const peakY = startY + zigHeight;
            const loopSize = 3 + Math.random() * 8;
            
            // Create partial loop
            const startAngle = Math.random() * Math.PI * 2;
            const arcLength = Math.PI * (0.4 + Math.random() * 1.0);
            const endAngle = startAngle + arcLength;
            
            // Calculate arc start point
            const arcStartX = peakX + loopSize * Math.cos(startAngle);
            const arcStartY = peakY + loopSize * Math.sin(startAngle);
            
            // Draw to arc start point
            ctx.lineTo(arcStartX, arcStartY);
            
            // Draw the arc
            ctx.arc(peakX, peakY, loopSize, startAngle, endAngle);
            
            // Return to the main path point
            ctx.lineTo(peakX, peakY);
          }
        }
      }
      
      // Update position after outburst
      currentX = startX + burstWidth;
      
      // Sometimes skip the vertical step after an outburst for more variety
      if (Math.random() > 0.3) {
        // Continue with vertical segment with slight randomness
        const jitterY = Math.random() * 10 - 5;
        currentY = currentY + segmentHeight + jitterY;
        ctx.lineTo(currentX, currentY);
      }
    }
  }
  
  // Ensure we connect to the right edge of the screen
  if (currentX < width * 0.95) {
    // Add a final horizontal line to reach the edge
    ctx.lineTo(width * 0.95, currentY);
  }
  
  // Finally stroke the entire continuous path
  ctx.stroke();
  
  // Draw a thin border around the neural box to better show its boundaries
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)'; // Very subtle border
  ctx.lineWidth = 0.5;
  ctx.rect(neuralBoxLeft, neuralBoxTop, neuralBoxWidth, neuralBoxHeight);
  ctx.stroke();
  
  // 4. Draw bottom scale - adding a nice orange border at the bottom and clear scale markers
  drawBottomScale(ctx, width, height);
}

// Helper function to draw the chaotic pattern with edge fading to avoid a cut-off appearance
function drawChaoticPattern(ctx, x, y, width, height, time, leftConnectionX, leftConnectionY, rightConnectionX, rightConnectionY) {
  // Use orange color for the chaotic pattern
  ctx.strokeStyle = 'rgba(255, 165, 0, 0.9)';
  ctx.lineWidth = 1.5;
  
  // Create a buffer zone around the edges for fade-out effect
  const bufferZone = 20; // pixels from edge where fade begins
  const safeX1 = x + bufferZone;
  const safeY1 = y + bufferZone;
  const safeX2 = x + width - bufferZone;
  const safeY2 = y + height - bufferZone;
  
  // Create a more contained pattern that doesn't reach all the way to the edges
  const centerWidth = width - (bufferZone * 2);
  const centerHeight = height - (bufferZone * 2);
  
  // First, draw specific connections to the left and right circuit paths
  // These ensure there are actual vertices in the chaotic pattern that connect to the circuits
  
  // Left connection - draw 3-4 lines branching from the connection point into the pattern
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(leftConnectionX, leftConnectionY);
    
    // Get the jump state from canvas
    const hasJump = ctx.canvas.hasJumpLeft || Math.random() < 0.1; // Either use global jump or 10% chance per branch
    
    // Create branch points with slight animation and occasional jumps
    const angle = (Math.PI / 3) * i + (time * 0.8) + Math.sin(time * 2.0) * 0.2
                  + (hasJump ? Math.random() * Math.PI : 0); // Random angle jump
    
    // Randomize length more dramatically if jumping
    const lengthJump = hasJump ? Math.random() * 40 : 0;
    const length = 20 + Math.random() * 15 + Math.sin(time * 1.5) * 5 + lengthJump;
    
    const endX = leftConnectionX + Math.cos(angle) * length;
    const endY = leftConnectionY + Math.sin(angle) * length;
    
    // Draw a slightly curved line to create branching effect
    // More extreme curvature during jumps
    const jitterMult = hasJump ? 3 : 1;
    const controlX = leftConnectionX + Math.cos(angle) * (length * 0.5) + (Math.random() * 12 - 6) * jitterMult;
    const controlY = leftConnectionY + Math.sin(angle) * (length * 0.5) + (Math.random() * 12 - 6) * jitterMult;
    
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.stroke();
    
    // Add a small circle at the branch end for a more interesting pattern
    // Occasionally make these larger during jumps
    const circleSize = hasJump ? (1 + Math.random() * 8) : (1 + Math.random() * 3);
    ctx.beginPath();
    ctx.arc(endX, endY, circleSize, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Right connection - draw 3-4 lines branching from the connection point into the pattern
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(rightConnectionX, rightConnectionY);
    
    // Get the jump state from canvas
    const hasJump = ctx.canvas.hasJumpRight || Math.random() < 0.1; // Either use global jump or 10% chance per branch
    
    // Create branch points with slight animation - use different pattern from left
    const angle = Math.PI + (Math.PI / 3) * i + (time * 0.6) + Math.cos(time * 1.7) * 0.3
                 + (hasJump ? Math.random() * Math.PI : 0); // Random angle jump
    
    // Randomize length more dramatically if jumping
    const lengthJump = hasJump ? Math.random() * 50 : 0;
    const length = 15 + Math.random() * 20 + Math.cos(time * 1.8) * 7 + lengthJump;
    
    const endX = rightConnectionX + Math.cos(angle) * length;
    const endY = rightConnectionY + Math.sin(angle) * length;
    
    // Draw a slightly curved line to create branching effect
    // More extreme curvature during jumps
    const jitterMult = hasJump ? 3 : 1;
    const controlX = rightConnectionX + Math.cos(angle) * (length * 0.5) + (Math.random() * 15 - 7.5) * jitterMult;
    const controlY = rightConnectionY + Math.sin(angle) * (length * 0.5) + (Math.random() * 15 - 7.5) * jitterMult;
    
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.stroke();
    
    // Add a small circle at the branch end for a more interesting pattern
    // Occasionally make these larger during jumps
    const circleSize = hasJump ? (1 + Math.random() * 10) : (1 + Math.random() * 4);
    ctx.beginPath();
    ctx.arc(endX, endY, circleSize, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Now generate the rest of the chaotic pattern
  // Generate more vertical flow lines
  for (let path = 0; path < 50; path++) { // Reduced slightly from 55 to 50
    ctx.beginPath();
    
    // Start positions more distributed throughout the box
    const startX = x + Math.random() * width;
    const startY = y + Math.random() * (height * 0.3); // Start more from the top
    ctx.moveTo(startX, startY);
    
    // Create a flowing pattern with more vertical tendency
    let currentX = startX;
    let currentY = startY;
    
    // More segments for more complexity
    const segments = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < segments; i++) {
      // Create target point with vertical bias
      const verticalBias = 0.7; // 70% vertical movement, 30% horizontal
      
      // Calculate target coordinates with bias to stay within safe area
      let targetX = currentX + (Math.random() - 0.5) * width * 0.25 * (1 - verticalBias);
      
      // Allow some lines to reach closer to the edges
      const reachToEdge = Math.random() > 0.7;
      if (reachToEdge) {
        if (targetX < x + (bufferZone / 2)) {
          targetX = x + Math.random() * bufferZone;
        } else if (targetX > x + width - (bufferZone / 2)) {
          targetX = x + width - Math.random() * bufferZone;
        }
      } else {
        // Regular containment logic with more room to move
        if (targetX < safeX1) {
          targetX = safeX1 + Math.random() * bufferZone;
        } else if (targetX > safeX2) {
          targetX = safeX2 - Math.random() * bufferZone;
        }
      }
      
      // Make the pattern flow downward more
      const downwardBias = 0.8; // 80% chance of downward movement
      const yDirection = Math.random() < downwardBias ? 1 : -1;
      let targetY = currentY + yDirection * Math.random() * height * 0.22 * verticalBias;
      
      // Allow some lines to reach closer to the top/bottom
      if (reachToEdge) {
        if (targetY < y + (bufferZone / 2)) {
          targetY = y + Math.random() * bufferZone;
        } else if (targetY > y + height - (bufferZone / 2)) {
          targetY = y + height - Math.random() * bufferZone;
        }
      } else {
        // Regular containment logic
        if (targetY < safeY1) {
          targetY = safeY1 + Math.random() * bufferZone;
        } else if (targetY > safeY2) {
          targetY = safeY2 - Math.random() * bufferZone;
        }
      }
      
      // Use bezier curves for smoother lines
      const cp1x = currentX + (targetX - currentX) * 0.3 + (Math.random() - 0.5) * 15;
      const cp1y = currentY + (targetY - currentY) * 0.3 + (Math.random() - 0.5) * 15;
      const cp2x = currentX + (targetX - currentX) * 0.7 + (Math.random() - 0.5) * 15;
      const cp2y = currentY + (targetY - currentY) * 0.7 + (Math.random() - 0.5) * 15;
      
      // Draw bezier curve segment
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetX, targetY);
      
      // Update current position
      currentX = targetX;
      currentY = targetY;
    }
    
    ctx.stroke();
  }
  
  // Add circular loops for the tangled effect - throughout the box
  for (let loop = 0; loop < 30; loop++) {
    ctx.beginPath();
    
    // Distribute circles throughout the neural box
    const centerX = x + Math.random() * width;
    const centerY = y + Math.random() * height;
    const radius = 5 + Math.random() * 15;
    
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Add horizontal wave patterns across the width
  for (let wave = 0; wave < 20; wave++) {
    ctx.beginPath();
    
    const waveY = y + Math.random() * height;
    const amplitude = 5 + Math.random() * 10;
    const frequency = 0.03 + Math.random() * 0.07;
    const phase = Math.random() * Math.PI * 2;
    
    ctx.moveTo(x, waveY);
    
    for (let xPos = 0; xPos <= width; xPos += 5) {
      const yPos = waveY + Math.sin((xPos) * frequency + phase + time * 0.2) * amplitude;
      ctx.lineTo(x + xPos, yPos);
    }
    
    ctx.stroke();
  }
  
  // Highlight the connection points with small circles
  // This makes it very clear where the left and right circuits connect to the pattern
  ctx.beginPath();
  ctx.arc(leftConnectionX, leftConnectionY, 3, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(rightConnectionX, rightConnectionY, 3, 0, Math.PI * 2);
  ctx.stroke();
}

// Helper function to draw the bottom scale (only on canvas - no DOM elements)
function drawBottomScale(ctx, width, height) {
  // Move the scale up to ensure it's fully visible
  const scaleY = height - 30; // Changed from 10 to 30
  
  // Draw the bottom border line
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 165, 0, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.moveTo(0, scaleY);
  ctx.lineTo(width, scaleY);
  ctx.stroke();
  
  // Add more detailed tick marks
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * width;
    const tickHeight = i % 5 === 0 ? 8 : (i % 2 === 0 ? 5 : 3);
    
    ctx.beginPath();
    ctx.moveTo(x, scaleY);
    ctx.lineTo(x, scaleY + tickHeight);
    ctx.stroke();
    
    // Add text labels at major points with larger font
    if (i > 0 && i < 10 && i % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.9)';
      ctx.textAlign = 'center';
      ctx.font = '14px monospace'; // Increased from 12px to 14px
      ctx.fillText(`+${i * 10}`, x, scaleY + 20); // Adjusted to position better below the line
    }
  }
  
  // Add small tick marks in between
  for (let i = 0; i < 100; i++) {
    if (i % 10 !== 0) { // Skip points we already marked
      const x = (i / 100) * width;
      
      ctx.beginPath();
      ctx.moveTo(x, scaleY);
      ctx.lineTo(x, scaleY + 2);
      ctx.stroke();
    }
  }
}

// Update and animate the psychographic display
function updatePsychographicDisplay(deltaTime) {
  const canvas = window.cachedElements.psychoCanvas;
  if (!canvas) return;
  
  // Track time for animation
  if (!canvas.timeOffset) {
    canvas.timeOffset = 0;
  }
  
  // Random chance of time jumps - makes animation suddenly skip ahead
  if (Math.random() < 0.08) { // 8% chance per frame of a time jump
    // Jump time forward by a random amount
    const jumpSize = Math.random() < 0.2 ? 
                    Math.random() * 10 : // 20% chance of large jump
                    Math.random() * 2;   // 80% chance of small jump
    canvas.timeOffset += jumpSize;
  } else {
    // Regular time progression
    canvas.timeOffset += deltaTime * 0.004;
  }
  
  // Occasionally reset the entire animation
  if (!canvas.lastRandomReset) {
    canvas.lastRandomReset = 0;
  }
  
  // Random reset every 5-15 seconds
  const randomResetInterval = 5000 + Math.random() * 10000;
  if (canvas.timeOffset - canvas.lastRandomReset > randomResetInterval) {
    if (Math.random() < 0.3) { // 30% chance to actually reset when interval is reached
      // Reset time to a random value to create a complete pattern change
      canvas.timeOffset = Math.random() * 1000; // Random position in animation cycle
      canvas.justReset = true;
    }
    canvas.lastRandomReset = canvas.timeOffset;
  } else {
    canvas.justReset = false;
  }
  
  // Get current time
  const elapsedTime = window.elapsedTime || 0;
  
  // Regular reset interval
  const resetInterval = 5000; // 5 seconds in milliseconds
  if (!canvas.lastReset || (elapsedTime - canvas.lastReset) > resetInterval) {
    canvas.lastReset = elapsedTime;
  }
  
  // Redraw the entire canvas with updated time
  drawPsychoCanvas(canvas);
}

// Export the functions so they can be imported in script.js
export {
  setupPsychographicDisplay,
  updatePsychographicDisplay
}; 