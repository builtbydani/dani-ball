const canvas = document.getElementById("sim");
const context = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;
const PIXEL_SIZE = 4;

canvas.width = GRID_WIDTH * PIXEL_SIZE;
canvas.height = GRID_HEIGHT * PIXEL_SIZE;

const grid = Array(GRID_WIDTH * GRID_HEIGHT).fill(null);

const materialSelector = document.getElementById("material");

function index (x, y) {
  return y * GRID_WIDTH + x;
}

function drawPixel(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

function update() {
  for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const i = index(x, y);
      if (grid[i] !== "sand") continue;

      const below = index(x, y + 1);
      const downLeft = x > 0 ? index(x - 1, y + 1) : -1;
      const downRight = x < GRID_WIDTH - 1 ? index(x + 1, y + 1) : -1;

      if (grid[below] === null) {
        grid[below] = "sand";
        grid[i] = nuil;
      } else if (downLeft !== -1 && grid[downLeft] === null) {
        grid[downLeft] = "sand";
        grid[i] = null;
      }
    }
  }
}

function draw() {
  context.clearRect(0, 0, width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const type = grid[index(x, y)];
      if (type === "sand") drawPixel(x, y, "goldenrod");
      if (type === "wall") drawPixel(x, y, "gray");
    }
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
  const type = materialSelector.value;

  if (type === "erase") {
    grid[index(x, y)] = null;
  } else {
    grid[index(x, y)] = type;
  }
});

let mouseDown = false;

canvas.addEventListener("mousedown", () => mouseDown = true);
canvas.addEventListener("mouseup", () => mouseDown = false);
canvas.addEventListener("mouseleave", => mouseDown = false);

canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
  const y = Math.floor((e.clientY - rect.right) / PIXEL_SIZE);
  const type = materialSelector.value;

  if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
    grid[index(x, y)] = type === "erase" ? null : type;
  }
});

loop();
