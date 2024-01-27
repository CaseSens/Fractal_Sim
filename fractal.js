const colorPicker = document.getElementById("colorPicker");
const displaySquare = document.getElementById("displaySquare");
const timerSlider = document.getElementById("timerSlider");
const timerText = document.getElementById("timerText");
const speedSlider = document.getElementById("speedSlider");
const speedText = document.getElementById("speedText");
const iterationText = document.getElementById("iterText");
const rotateSlider = document.getElementById("rotateSlider");
const widthSlider = document.getElementById("widthSlider");
const lengthSlider = document.getElementById("lengthSlider");
const widthText = document.getElementById("widthText");
const lengthText = document.getElementById("lengthText");
const changeColorsBox = document.getElementById("colorChangeBox");
const trailsBox = document.getElementById("trailsBox");
const clearCanvasButton = document.getElementById("clearCanvas");
const audioBox = document.getElementById("audioBox");

const AUDIO_PLAYBACK_RATE = 1.8;
let audioVolume = 0.1;

let movementSpeed = speedSlider.value;
let intervalSpeed = timerSlider.value;
let rotationAngle = parseFloat(rotateSlider.value);
let chosenAngle = 0;
let playing = false;
let interval = null;
let timePassed = 0;
let width = widthSlider.value;
let length = lengthSlider.value;
let allowChangeColors = changeColorsBox.value;
let allowTrails = trailsBox.value;
let allowAudio = audioBox.value;

colorPicker.addEventListener("input", (event) => {
  displaySquare.style.backgroundColor = event.target.value;
});

document.addEventListener("angleChanged", (event) => {
  chosenAngle = event.detail.angle;
  console.log(`chosenAngle: ${chosenAngle}`);
});

timerText.innerHTML = `${timerSlider.value} ms`;

timerSlider.oninput = function () {
  timerText.innerHTML = `${this.value} ms`;
  intervalSpeed = this.value;
  if (playing) {
    clearInterval(interval);
    start();
  }
};

speedSlider.oninput = function () {
  speedText.innerHTML = `${this.value} units`;
  movementSpeed = this.value;
};

rotateSlider.oninput = function () {
  rotateText.innerHTML = `${this.value} degrees`;
  rotationAngle = parseFloat(this.value);
};

widthSlider.oninput = function () {
  widthText.innerHTML = `${this.value}px`;
  displaySquare.style.width = `${this.value}px`;
};

lengthSlider.oninput = function () {
  lengthText.innerHTML = `${this.value}px`;
  displaySquare.style.height = `${this.value}px`;
};

changeColorsBox.oninput = function () {
  allowChangeColors = !allowChangeColors;
};

trailsBox.oninput = function () {
  allowTrails = !allowTrails;
};

audioBox.oninput = function () {
  allowAudio = !allowAudio;
};

clearCanvasButton.addEventListener("click", clearCanvas);

function clearCanvas() {
  if (playing) {
    stop();
  }
  audioVolume = 0.1;
  squares = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", () => {
  if (squares.length === 0) {
    alert("You need at least 1 item in the canvas to begin the simulation");
    return;
  }

  if (playing) {
    stop();
    return;
  } else {
    start();
    return;
  }
});

function start() {
  console.log(`started with interval ${intervalSpeed} ms`);
  interval = setInterval(() => {
    moveSquares();
  }, intervalSpeed);
  playing = true;
  playBtn.innerHTML = "Stop";
}

function stop() {
  console.log("stopped");
  clearInterval(interval);
  playing = false;
  playBtn.innerHTML = "Play";
}

const addSquareBtn = document.getElementById("addSquareBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let squares = [];

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(event.clientX - rect.left);
  const y = Math.round(event.clientY - rect.top);

  const computedStyle = getComputedStyle(displaySquare);

  const width = parseInt(computedStyle.width, 10);
  const height = parseInt(computedStyle.height, 10);
  const color = computedStyle.backgroundColor;
  console.log(`color at canvas listener: ${color}`);

  const sLeft = x - width / 2;
  const sRight = x + width / 2;
  const sTop = y - height / 2;
  const sBottom = y + height / 2;

  const sBounds = { sLeft, sTop, sRight, sBottom };

  if (overlaps(sBounds)) {
    console.log("overlaps");
    selectingPosition = false;
    return;
  }

  addSquare(x, y, width, height, chosenAngle, color, false, null);
  console.log(squares);
});

function overlaps(sBounds) {
  const sLeft = sBounds.sLeft;
  const sRight = sBounds.sRight;
  const sBottom = sBounds.sBottom;
  const sTop = sBounds.sTop;

  if (
    sLeft <= 0 ||
    sRight >= canvas.width ||
    sTop <= 0 ||
    sBottom >= canvas.height
  ) {
    return true;
  }

  for (let i = 0; i < squares.length; i++) {
    const square = squares[i];
    const existingSquareLeft = square.x - square.width / 2;
    const existingSquareRight = square.x + square.width / 2;
    const existingSquareTop = square.y - square.height / 2;
    const existingSquareBottom = square.y + square.height / 2;

    // Check if new square is to the left, right, above, or below the existing square
    if (
      sLeft > existingSquareRight ||
      sRight < existingSquareLeft ||
      sTop > existingSquareBottom ||
      sBottom < existingSquareTop
    ) {
      continue; // No overlap with this square, move on to the next
    } else {
      return true; // Overlaps with this square
    }
  }

  return false;
}

function addSquare(x, y, width, height, angle, color, collided, sideHit) {
  console.log(
    `adding square ${x}, ${y}, ${width}, ${height}, ${chosenAngle}, ${color}`
  );
  squares.push({ x, y, width, height, angle, color, collided, sideHit });
  drawSquare(x, y, width, height, color);
}

function drawSquare(x, y, width, height, color) {
  console.log("drawing square");
  console.log(`color: ${color}`);

  const strokeWidth = 2;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const adjustedWidth = width - strokeWidth;
  const adjustedHeight = height - strokeWidth;

  ctx.fillStyle = color;
  ctx.fillRect(x - halfWidth, y - halfHeight, width, height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = strokeWidth;
  ctx.strokeRect(x - halfWidth, y - halfHeight, width, height);

  selectingPosition = false;
}

function moveSquares() {
  const squaresCopy = [...squares];

  squaresCopy.forEach((square) => {
    let leftEdge = square.x - square.width / 2;
    let rightEdge = square.x + square.width / 2;
    let topEdge = square.y - square.height / 2;
    let bottomEdge = square.y + square.height / 2;
    let combinedAngle = (square.angle + rotationAngle) % 360;
    if (combinedAngle < 0) combinedAngle += 360;

    let angleInRadians = (combinedAngle * Math.PI) / 180; // rotation angle
    let dx = movementSpeed * Math.sin(angleInRadians); // Swapped sin and cos cause 0deg is up in my plane
    let dy = -movementSpeed * Math.cos(angleInRadians); // y is still inverted because canvas y increases downward

    let potentialLeft = leftEdge + dx;
    let potentialRight = rightEdge + dx;
    let potentialTop = topEdge + dy;
    let potentialBottom = bottomEdge + dy;

    if (potentialLeft < 0) {
      dx = -leftEdge;
    }
    if (potentialRight > canvas.width) {
      dx = canvas.width - rightEdge;
    }
    if (potentialTop < 0) {
      dy = -topEdge;
    }
    if (potentialBottom > canvas.height) {
      dy = canvas.height - bottomEdge;
    }

    // Update square's x and y
    square.x += dx;
    square.y += dy;
  });

  checkForCollisions(squaresCopy);

  squares = squaresCopy;
  redrawSquares();
  timePassed++;
  iterationText.innerHTML = `Iterations: ${timePassed}`;
}

let collisions = 0;
const collisionText = document.getElementById("collisionText");

function checkForCollisions(squaresCopy) {
  const canvasStart = 0;
  const canvasEnd = canvas.width;
  const canvasTop = 0;
  const canvasBottom = canvas.height;

  for (let i = 0; i < squaresCopy.length; i++) {
    const square = squaresCopy[i];

    if (square.collided) {
      continue;
    }

    const sLeft = square.x - square.width / 2;
    const sRight = square.x + square.width / 2;
    const sTop = square.y - square.height / 2;
    const sBottom = square.y + square.height / 2;
    const sBounds = { square, sLeft, sRight, sTop, sBottom };

    hitsCanvas(sBounds);
    hitsSquare(sBounds);
  }

  squaresCopy.forEach((square) => {
    if (square.collided) {
      let newAngle;

      switch (square.sideHit) {
        case "left":
        case "right":
          newAngle = 360 - square.angle;
          break;
        case "top":
        case "bottom":
          newAngle = 180 - square.angle;
          break;
      }

      // Normalize the angle to the range [0, 360)
      square.angle = (newAngle + 360) % 360;
      square.collided = false;
      square.sideHit = null;
    }
  });

  function hitsCanvas(sBounds) {
    const square = sBounds.square;

    let hitWall = null;

    if (sBounds.sLeft <= canvasStart) {
      hitWall = "left";
    } else if (sBounds.sTop <= canvasTop) {
      hitWall = "top";
    } else if (sBounds.sRight >= canvasEnd) {
      hitWall = "right";
    } else if (sBounds.sBottom >= canvasBottom) {
      hitWall = "bottom";
    }

    if (hitWall) {
      collisions++;
      deltaCollisions++;
      setCollisionText();
      square.sideHit = hitWall;
      square.collided = true;
      if (allowAudio) {
        const audio = new Audio("resources/collision.wav");
        audio.volume = adjustAudioVolume();
        audio.playbackRate = AUDIO_PLAYBACK_RATE;
        audio.play();
      }
    }
    return;
  }

  function hitsSquare(sBounds) {
    const originalSquare = sBounds.square;
    const sLeft = sBounds.sLeft;
    const sRight = sBounds.sRight;
    const sBottom = sBounds.sBottom;
    const sTop = sBounds.sTop;

    for (let i = 0; i < squaresCopy.length; i++) {
      const existingSquare = squaresCopy[i];

      if (existingSquare.collided) continue;
      if (originalSquare === existingSquare) continue;

      const existingSquareLeft = existingSquare.x - existingSquare.width / 2;
      const existingSquareRight = existingSquare.x + existingSquare.width / 2;
      const existingSquareTop = existingSquare.y - existingSquare.height / 2;
      const existingSquareBottom = existingSquare.y + existingSquare.height / 2;

      // Check if new square is to the left, right, above, or below the existing square
      if (
        sLeft > existingSquareRight ||
        sRight < existingSquareLeft ||
        sTop > existingSquareBottom ||
        sBottom < existingSquareTop
      ) {
        continue; // No overlap with this square, move on to the next
      } else {
        // Overlaps with this square
        let overlapX, overlapY;

        // calculate horizontal overlap
        if (originalSquare.x < existingSquare.x) {
          overlapX = sRight - existingSquareLeft;
        } else {
          overlapX = existingSquareRight - sLeft;
        }

        // calculate vertical overlap
        if (originalSquare.y < existingSquare.y) {
          overlapY = sBottom - existingSquareTop;
        } else {
          overlapY = existingSquareBottom - sTop;
        }

        // Identify which side of the originalSquare collided
        if (overlapX < overlapY) {
          if (originalSquare.x < existingSquare.x) {
            originalSquare.sideHit = "right";
            existingSquare.sideHit = "left";
          } else {
            originalSquare.sideHit = "left";
            existingSquare.sideHit = "right";
          }
        } else {
          if (originalSquare.y < existingSquare.y) {
            originalSquare.sideHit = "bottom";
            existingSquare.sideHit = "top";
          } else {
            originalSquare.sideHit = "top";
            existingSquare.sideHit = "bottom";
          }
        }

        // Adjust the original square's position based on the overlap
        if (overlapX < overlapY) {
          originalSquare.x -=
            originalSquare.x < existingSquare.x ? overlapX : -overlapX;
        } else {
          originalSquare.y -=
            originalSquare.y < existingSquare.y ? overlapY : -overlapY;
        }

        originalSquare.collided = true;
        existingSquare.collided = true;
        collisions++;
        deltaCollisions++;
        setCollisionText();

        if (allowAudio) {
          const audio = new Audio("resources/collision.wav");
          audio.volume = adjustAudioVolume();
          audio.playbackRate = AUDIO_PLAYBACK_RATE;
          audio.play();
        }
        return; // Return after handling one collision. If you want to handle multiple collisions in a single interval, remove this line.
      }
    }
    return;
  }
}

function redrawSquares() {
  if (!allowTrails) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  squares.forEach((square) => {
    if (allowChangeColors) {
      changeColors(square);
    }
    const strokeWidth = 2;
    const halfWidth = square.width / 2;
    const halfHeight = square.height / 2;
    const adjustedWidth = square.width - strokeWidth;
    const adjustedHeight = square.height - strokeWidth;

    ctx.fillStyle = square.color;
    ctx.fillRect(
      square.x - halfWidth,
      square.y - halfHeight,
      square.width,
      square.height
    );

    ctx.strokeStyle = "black";
    ctx.lineWidth = strokeWidth;
    ctx.strokeRect(
      square.x - halfWidth,
      square.y - halfHeight,
      adjustedWidth,
      adjustedHeight
    );
  });
}

function changeColors(square) {
  const color = square.color;
  const rgb = getRgbValues(color);

  let newRed, newGreen, newBlue;

  // Calculate the potential new values
  newRed = rgb.red + Math.round(12 * Math.sin(timePassed + 1));
  newGreen = rgb.green + Math.round(12 * Math.sin(timePassed + 2));
  newBlue = rgb.blue + Math.round(12 * Math.sin(timePassed + 3));

  // Adjust values if they exceed the bounds
  newRed = adjustToBounds(newRed);
  newGreen = adjustToBounds(newGreen);
  newBlue = adjustToBounds(newBlue);

  square.color = `rgb(${newRed}, ${newGreen}, ${newBlue})`;
  return;

  function getRgbValues(color) {
    const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return {
      red: Number(match[1]),
      green: Number(match[2]),
      blue: Number(match[3]),
    };
  }

  function adjustToBounds(value) {
    if (value > 255) {
      return 255 - (value - 255);
    } else if (value < 0) {
      return -value;
    }
    return value;
  }
}

function adjustAudioVolume() {
  const base = 0.9;
  let volume = 0.1 * Math.pow(base, squares.length);

  return volume;
}

let deltaCollisions = 0;
const deltaColText = document.getElementById("deltaCollisionText");
const deltaColAvgText = document.getElementById("deltaCollisionAverageText");

function setCollisionText() {
  collisionText.innerHTML = `Collisions: ${collisions}`;
}

function updateCollisionRate() {
  deltaColText.innerHTML = `Collisions per second: ${deltaCollisions} col/s`;

  deltaCollisions = 0; // reset for the next second
  setTimeout(updateCollisionRate, 1000);
}

let deltaSeconds = 0;

function updateAverageCollisionRates() {
  console.log(deltaSeconds);
  if (playing) {
    deltaSeconds += 0.5;
  }
  let cps;
  if (collisions != 0) {
    cps = collisions / deltaSeconds;
    cps = Math.round(cps);
  } else {
    cps = 0;
  }

  deltaColAvgText.innerHTML = `Average Collision Rate: ${cps} col/s`;
  setTimeout(updateAverageCollisionRates, 500);
}

updateCollisionRate();
updateAverageCollisionRates();

const fpsCounter = document.getElementById('fpsCounter');
let frames = 0;
let lastTime = performance.now();
let fps = 0;

function updateFPS() {
  frames++;
  let currentTime = performance.now();
  let deltaTime = currentTime - lastTime;

  if (deltaTime > 1000) {
    fps = (frames * 1000) / deltaTime;
    fpsCounter.innerHTML = `FPS: ${Math.round(fps)}`;

    frames = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(updateFPS);
}

updateFPS();