let table;
let points = [];
let t = 0;
let maxTime = 0;
let labels = [];
let dataLoaded = false;

// tweakable params
let timeSpeed = 0.02;
let labelInterval = 3;
let labelFadeStep = 2;

function preload() {
  // Try different path approaches
  table = loadTable("BLOCK/DataEye.csv", "csv", "header", 
    function() {
      console.log("CSV loaded successfully!");
      dataLoaded = true;
    },
    function(error) {
      console.error("Error loading CSV:", error);
      // Try alternative paths
      table = loadTable("./BLOCK/DataEye.csv", "csv", "header", 
        function() {
          console.log("CSV loaded with ./ path");
          dataLoaded = true;
        },
        function(error2) {
          console.error("Also failed with ./ path:", error2);
          dataLoaded = false;
        }
      );
    }
  );
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  textFont('monospace');
  textSize(12);
  noStroke();

  // Wait a bit for data to load
  setTimeout(processData, 100);
}

function processData() {
  if (!table || !dataLoaded) {
    console.error("Table not loaded yet");
    // Try to create dummy data for testing
    createTestData();
    return;
  }

  console.log("Table rows:", table.getRowCount());
  console.log("Columns:", table.columns);
  
  for (let r = 0; r < table.getRowCount(); r++) {
    let times = float(table.getString(r, "times")); 
    let x = float(table.getString(r, "x")); 
    let y = float(table.getString(r, "y")); 
    points.push({ times, x, y });
  }
  
  if (points.length > 0) {
    maxTime = points[points.length - 1].times;
    console.log(`Loaded ${points.length} points, maxTime: ${maxTime}`);
  } else {
    console.error("No points loaded, using test data");
    createTestData();
  }
}

function createTestData() {
  // Create some test data to verify the animation works
  points = [];
  for (let i = 0; i < 100; i++) {
    points.push({
      times: i * 0.1,
      x: 0.1 + 0.8 * noise(i * 0.1),
      y: 0.1 + 0.8 * noise(i * 0.1 + 1000)
    });
  }
  maxTime = points[points.length - 1].times;
  console.log("Using test data with", points.length, "points");
}

function draw() {
  // Use clear() instead of background() to make canvas transparent
  clear();
  
  // advance time
  t += timeSpeed;
  if (t > maxTime) t = 0;

  // find interpolation pair p1,p2 for current t
  let p1 = null, p2 = null;
  for (let i = 0; i < points.length - 1; i++) {
    if (t >= points[i].times && t <= points[i + 1].times) {
      p1 = points[i];
      p2 = points[i + 1];
      break;
    }
  }

  if (p1 && p2) {
    let amt = map(t, p1.times, p2.times, 0, 1);
    let nx = lerp(p1.x, p2.x, amt);
    let ny = lerp(p1.y, p2.y, amt);

    let cx = nx * width;
    let cy = ny * height;

    if (frameCount % labelInterval === 0) {
      let labelText = nf(nx, 1, 3) + " & " + nf(ny, 1, 3);
      labels.push({ x: cx, y: cy, txt: labelText, a: 255 });
    }

    // Draw the tracking dot - make it visible against the video
    fill(255, 0, 0, 200); // Red with opacity
    stroke(255, 255, 255); // White border
    strokeWeight(3);
    circle(cx, cy, 24); // Larger dot for visibility

    drawAndFadeLabels();
  } else {
    drawAndFadeLabels();
  }
}


function drawAndFadeLabels() {
  for (let i = labels.length - 1; i >= 0; i--) {
    let L = labels[i];
    fill(255, 255, 255, L.a);
    noStroke();
    textAlign(LEFT, CENTER);
    text(L.txt, L.x + 15, L.y - 15);

    L.a -= labelFadeStep;
    if (L.a <= 0) labels.splice(i, 1);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
