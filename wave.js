/**
 * Additive Wave
 * by Daniel Shiffman. 
 * 
 * Create a more complex wave by adding two waves together. 
 */

let xspacing = 4;   // How far apart should each horizontal location be spaced
let w;              // Width of entire wave
let maxwaves = 4;   // total # of waves to add together

let theta = 0.0;
let amplitude = [];   // Height of wave
let dx = [];          // Value for incrementing X, to be calculated as a function of period and xspacing
let yvalues = [];     // Using an array to store height values for the wave (not entirely necessary)

function setup() {
  createCanvas(640, 360)
  frameRate(30);
  colorMode(RGB, 255, 255, 255, 100);
  w = width * 0.75;

  for (let i = 0; i < maxwaves; i++) {
    amplitude[i] = random(10,20);
    let period = random(100,300); // How many pixels before the wave repeats
    dx[i] = (TWO_PI / period) * xspacing;
  }

  yvalues = newArray(parseInt(w/xspacing), 0);
  noLoop();
}

function draw() {
  background(255);
  calcWave();
  renderWave();
}

function calcWave() {
  // Increment theta (try different values for 'angular velocity' here
  theta += 0.02;

  // Set all height values to zero
  for (let i = 0; i < yvalues.length; i++) {
    yvalues[i] = 0;
  }

  // Accumulate wave height values
  for (let j = 0; j < maxwaves; j++) {
    let x = theta;
    for (let i = 0; i < yvalues.length; i++) {
      yvalues[i] += sin(x)*amplitude[j];
      x+=dx[j];
    }
  }
}

function renderWave() {
  // A simple way to draw the wave with an ellipse at each location
  noStroke();
  push()
  fill(255,0,0);
  ellipseMode(CENTER);
  beginShape()
  for (let x = 0; x < yvalues.length; x++) {
    // ellipse(x*xspacing,height/2+yvalues[x],16,16);
    vertex(x*xspacing,height/2+yvalues[x])
  }
  for (let x = yvalues.length; x >0; x--) {
    // ellipse(x*xspacing,height/2+yvalues[x],16,16);
    vertex(x*xspacing,height/2+yvalues[x] + xspacing + 0.1 * (x))
  }
  endShape(CLOSE)
  pop()
  let lastX = (yvalues.length - 1) * xspacing
  let lastY = height/2 + yvalues[yvalues.length-1]
  // weapon
  push()
  fill(0,0,0);
  quad(lastX + 20, lastY - 10, lastX + 22, lastY - 10, lastX-16, lastY + 36, lastX-18, lastY + 36,);
  pop()
  // head
  push()
  fill(0,0,0);
  ellipse(lastX + 4, lastY - 8, 16, 20);
  pop()
  // body
  push()
  fill(0,0,0);
  rect(lastX, lastY-2, 8, 30);
  pop()
  // legs
  push()
  fill(0,0,0);
  rect(lastX, lastY+28, 2, 20);
  pop()
  push()
  fill(0,0,0);
  rect(lastX+6, lastY+28, 2, 20);
  pop()
  
}

function newArray (n, value) {
  n = n || 0;
  var array = new Array(n);
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array
}
