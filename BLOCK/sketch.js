

let table;
let points = [];
let t = 0;            // animation clock (same units as CSV time)
let maxTime = 0;
let labels = [];      // stores {x,y,txt,a}

// tweakable params
let timeSpeed = 0.02; // how much t advances each frame
let labelInterval = 3;
let labelFadeStep = 2;

function preload() {
  table = loadTable("DataEye.csv", "csv", "header");
}

function setup() {
  createCanvas(800, 600);
  textFont('monospace');
  textSize(12);
  noStroke();

  
  for (let r = 0; r < table.getRowCount(); r++) {
    let times = float(table.getString(r, "times")); 

    let x = float(table.getString(r, "x")); 
    let y = float(table.getString(r, "y")); 
    points.push({ times, x, y });
  }
  if (points.length > 0) {
    maxTime = points[points.length - 1].times;
  }
}

function draw() {
  background(0, 75);

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

    fill(255, 100, 100);
    noStroke();
    circle(cx, cy, 15);

    drawAndFadeLabels();
  } else {
    drawAndFadeLabels();
  }
}

// draw labels and fade
function drawAndFadeLabels() {
  for (let i = labels.length - 1; i >= 0; i--) {
    let L = labels[i];
    fill(255, 100, 100);
    noStroke();
    textAlign(LEFT, CENTER);
    text(L.txt, L.x + 12, L.y - 12);

    L.a -= labelFadeStep;
    if (L.a <= 0) labels.splice(i, 1);
  }
}
