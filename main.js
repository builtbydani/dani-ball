const GRID_WIDTH = 100;
const GRID_HEIGHT = 100;
const PIXEL_SIZE = 4;

const canvas = document.getElementById("sim");
canvas.width = GRID_WIDTH * PIXEL_SIZE;
canvas.height = GRID_HEIGHT * PIXEL_SIZE;
const context = canvas.getContext("2d");

const grid = Array(GRID_WIDTH * GRID_HEIGHT).fill(null);
const materialSelector = document.getElementById("material");

const MATERIALS = {
  sand: { color: "goldenrod", density: 2 },
  water: { color: "deepskyblue", density: 1},
  wall: { color: "gray", density: Infinity },
};


function isPassable(type) {
  return type === null;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function index(x, y) {
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
      const type = grid[i];

      if (type === "sand") {
        const below = index(x, y + 1);
        const downLeft = x > 0 ? index(x - 1, y + 1) : -1;
        const downRight = x < GRID_WIDTH - 1 ? index(x + 1, y + 1) : -1;

        const dirs = Math.random() < 0.5
          ? [below, downLeft, downRight]
          : [below, downRight, downLeft];

        for (const target of dirs) {
          if (target === -1) continue;

          const targetType = grid[target];

          // If target is empty, move
          if (targetType === null) {
            grid[target] = "sand";
            grid[i] = null;
            break;
          }

          // If target is water and lighter, swap
          if (
            targetType === "water" &&
            MATERIALS["sand"].density > MATERIALS["water"].density
          ) {
            grid[target] = "sand";
            grid[i] = "water";
            break;
          }
        }
      }

      if (type === "water") {
        const below = index(x, y + 1);
        const left = x > 0 ? index(x - 1, y) : -1;
        const right = x < GRID_WIDTH - 1 ? index(x + 1, y) : -1;
        const downLeft = x > 0 ? index(x - 1, y + 1) : -1;
        const downRight = x < GRID_WIDTH - 1 ? index(x + 1, y + 1) : -1;

        const dirs = shuffle([
          below, downLeft, downRight,
          left, right
        ]);

        for (const target of dirs) {
          const targetType = grid[target];
          if (target !== -1 && isPassable(targetType)) {
            grid[target] = "water";
            grid[i] = null;
            break;
          }
        }
      }
    }
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const type = grid[index(x, y)];
      if (type && MATERIALS[type]) {
        drawPixel(x, y, MATERIALS[type].color);
      }
    }
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

let mouseDown = false;

canvas.addEventListener("mousedown", () => mouseDown = true);
canvas.addEventListener("mouseup", () => mouseDown = false);
canvas.addEventListener("mouseleave", () => mouseDown = false);

canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
  const type = materialSelector.value;

  if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
    grid[index(x, y)] = type === "erase" ? null : type;
  }
});

loop();

