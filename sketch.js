
let settings = {
  sigma: 3,
  layers: 55,
  deformations: 2,
  mask: false,
  maskCircles: 300,
  maskCircleSize: 5,
  colorSize: 350,
  spread: 450,
  randomSeed: 'alex',
  shapePoints: 10,
  colors: 1,
  showSteps: false,
}

let step = 0
let shapes = []
let basicColors = []
let rand
let maxStep = 1
let layerStep = 0

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  
  let seed  = getParameterByName('seed')
  let colors  = getParameterByName('colors')
  let shapePoints = getParameterByName('points')
  let showSteps = getParameterByName('showSteps')
  if (seed) {
    settings.randomSeed = seed
  }
  if (colors) {
    settings.colors = colors
  }
  if (shapePoints) {
    settings.shapePoints = shapePoints
  }
  if (showSteps === 'true') {
    settings.showSteps = true
  }
  rand = new alea(settings.randomSeed)
  const rate = settings.showSteps ? 30 : 1
  frameRate(rate)

  basicColors = newArray(settings.colors).map((_, i) => {
    const color = [
      rand() * 256 | 0,
      rand() * 256 | 0,
      rand() * 256 | 0
    ]

    const rads = rand() * Math.PI * 2
    const dist = i ? Math.pow(rand(), 0.5) * height / (1 * settings.colors) : 0
    const position = [
      Math.cos(rads) * dist + width/2,
      Math.sin(rads) * dist + height/2
    ]
    return { color, position }
  })
  shapes = basicColors.map(({ color, position }) => {
    let points = newArray(settings.shapePoints).map((_, i) => {
      const rads = Math.PI * 2 / settings.shapePoints * i
      return [
        Math.cos(rads) * settings.colorSize + position[0],
        Math.sin(rads) * settings.colorSize + position[1]
      ]
    })

    let j = settings.deformations + 2
    points = deformPolygon(points, j)

    // fix this to turn any color representation into rgb
    const rgb = color

    return { points, rgb }
  })
  maxStep = settings.colors * settings.layers + 1
  layerStep = settings.colors * settings.layers
}

function draw() {
  const max = settings.showSteps ? maxStep : 1
  if (step > max) {
    return
  }
  background(255);

  // basic polygon
  if (step === 0) {
    shapes.map(({ points, rgb }) => {
      drawPolygon(points, getBasicColor(rgb, 1))
    })
  }
  if (step > 0) {
    let q = settings.showSteps ? step - 1 : shapes.length * settings.layers
    while (q--) {
      const { points, rgb } = shapes[q % shapes.length]
      let detailedDeform = points.slice()
      // let k = settings.deformations
      detailedDeform = deformPolygon(detailedDeform, settings.deformations)
      const opacity = 1 / (settings.layers)
      drawPolygonWithMask(detailedDeform, getBasicColor(rgb, opacity))
    }
  }
  step++
}

function polygon(x, y, radius, npoints) {
  let points = []
  let angle = TWO_PI / npoints;
  // beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    // vertex(sx, sy);
    points.push([sx, sy])
  }
  // endShape(CLOSE);
  return points
}

function deformPolygon(points, deformations) {
  while(deformations--) {
    let newPoints = []
    for (let i = 0; i < points.length; i++) {
      newPoints.push(points[i])
      const nextPoint = points[i + 1] || points[0]
      newPoints.push(vec2Lerp(points[i], nextPoint, rand()))
    }
    newPoints = newPoints.map((pt, i) => {
      const lastPt = newPoints[i - 1] || newPoints[newPoints.length - 1]
      const nextPt = newPoints[i + 1] || newPoints[0]
      const distToClosestPt = (vec2Distance(pt, lastPt) + vec2Distance(pt, nextPt)) / 2
      // const sigma = random() > 0.7 ? 3 : 2
      const r = myNormal(0, distToClosestPt / settings.sigma, rand)
      return [
        r() + pt[0],
        r() + pt[1]
      ]
    })
    points = newPoints
  }
  return points
}

function vec2Distance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return Math.sqrt(x*x + y*y)
}


function vec2Lerp(a, b, t) {
  let out = []
  var ax = a[0],
      ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out
}

function myNormal(mu, sigma, rand) {
  var x, r
  mu = mu == null ? 0 : +mu
  sigma = sigma == null ? 1 : +sigma
  rand = rand == null ? Math.random : rand
  return function () {
    var y

    // If available, use the second previously-generated uniform random.
    if (x != null) {
      y = x
      x = null
    // eslint-disable-next-line
    } else do { // Otherwise, generate a new x and y.
      x = rand() * 2 - 1
      y = rand() * 2 - 1
      r = x * x + y * y
    } while (!r || r > 1)

    return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r)
  }
}

function setMask (bounds, c) {
  const [xMin, yMin] = bounds[0]
  const [xMax, yMax] = bounds[1]
  push();
  fill(color(c));
  // translate(width * 0.5, height * 0.5)
  beginShape()
  let j = settings.maskCircles
  while (j--) {
    const x = lerp(xMin, xMax, rand())
    const y = lerp(yMin, yMax, rand())
    const radius = rand() * settings.maskCircleSize
    circle(x, y, radius)
  }
  endShape(CLOSE)
  pop()
}

function drawPolygonWithMask (poly, color) {
  const polygonBounds = getPolygonExtent(poly)
  if (settings.mask) {
    setMask(polygonBounds, color)
  }
  drawPolygon(poly, color)
}

function getPolygonExtent (poly) {
  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity
  for (let point of poly) {
    xMin = point[0] < xMin ? point[0] : xMin
    xMax = point[0] > xMax ? point[0] : xMax
    yMin = point[1] < yMin ? point[1] : yMin
    yMax = point[1] > yMax ? point[1] : yMax
  }
  return [
    [xMin, yMin],
    [xMax, yMax]
  ]
}

function drawPolygon(poly, c) {
  push();
  fill(color(c))
  // translate(width/2, height/2)
  beginShape()
  poly.map(pt => {
    vertex(pt[0], pt[1])
  })
  endShape(CLOSE)
  pop()
}

function getBasicColor(color, opacity) {
  return `rgba(${color.join(',')}, ${opacity})`
}

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function newArray (n, value) {
  n = n || 0;
  var array = new Array(n);
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array
}
