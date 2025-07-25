// Particle Simulator with Fire support added (fixed null object check)

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
  water: { color: "deepskyblue", density: 1 },
  wall: { color: "gray", density: Infinity },
  fire: { color: "orangered", density: 0 },
  oil: { color: "darkgoldenrod", density: 0.8 },
  vine: { color: "mediumseagreen", density: 0 },
};

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
      const cell = grid[i];
      const type = (typeof cell === "object" && cell !== null) ? cell.type : cell;

      if (type === "sand") {
        const below = index(x, y + 1);
        const downLeft = x > 0 ? index(x - 1, y + 1) : -1;
        const downRight = x < GRID_WIDTH - 1 ? index(x + 1, y + 1) : -1;

        const dirs = Math.random() < 0.5 ? [below, downLeft, downRight] : 
          [below, downRight, downLeft];

        for (const target of dirs) {
          if (target === -1) continue;

          const targetType = grid[target];

          if (targetType === null) {
            grid[target] = "sand";
            grid[i] = null;
            break;
          }

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

        const dirs = shuffle([below, downLeft, downRight, left, right]);

        for (const target of dirs) {
          if (target !== -1 && grid[target] === null) {
            grid[target] = "water";
            grid[i] = null;
            break;
          }
        }
      }

      if (type === "oil") {
        const below = index(x, y + 1);
        const left = x > 0 ? index(x - 1, y) : -1;
        const right = x < GRID_WIDTH - 1 ? index(x + 1, y) : -1;
        const downLeft = x > 0 ? index(x - 1, y + 1) : -1;
        const downRight = x < GRID_WIDTH - 1 ? index(x + 1, y + 1) : -1;

        const dirs = shuffle([below, downLeft, downRight, left, right]);

        for (const target of dirs) {
          if (target !== -1 && grid[target] === null) {
            grid[target] = "oil";
            grid[i] = null;
            break;
          }
        }
      }

     if (cell && typeof cell === "object" && cell.type === "vine") {
      cell.age = (cell.age || 0) + 1;
      if (cell.age > 30) continue; // Stop growing after a while

      const growChance = 0.05;
      if (Math.random() < growChance) {
        const growTargets = shuffle([
          [x, y - 1], // up
          [x - 1, y], // left
          [x + 1, y], // right
        ]);

        for (const [nx, ny] of growTargets) {
          if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) continue;

          const ni = index(nx, ny);
          if (grid[ni] === null) {
            // Check if there's a wall next to it to cling to
            const neighbors = [
              index(nx - 1, ny),
              index(nx + 1, ny),
              index(nx, ny + 1),
            ];

            const nearWall = neighbors.some(
              (ni2) =>
                ni2 >= 0 &&
                ni2 < grid.length &&
                grid[ni2] === "wall"
            );

            // Prefer to grow if touching wall, or just grow randomly
            if (nearWall || Math.random() < 0.5) {
              grid[ni] = { type: "vine", age: 0 };
              break;
            }
          }
        }
      }
    }
 

      if (typeof cell === "object" && cell !== null && cell.type === "fire") {
        cell.age++;

        const FLAME_LIFESPAN = 5;
        const spreadTargets = [
          [x, y - 1],
          [x, y + 1],
          [x - 1, y],
          [x + 1, y],
        ];

        for (const [nx, ny] of spreadTargets) {
          if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) continue;

          const ni = index(nx, ny);
          const neighbor = grid[ni];

          if (neighbor === "oil" || neighbor === "vine") {
            grid[ni] = { type: "fire", age: 0 };
          }
        }

        if (cell.age >= FLAME_LIFESPAN) {
          grid[i] = null;
        }
      }
    }
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = grid[index(x, y)];
      if (cell !== null) {
        let type;
        if (typeof cell === "object" && cell !== null) {
          type = cell.type;
        } else {
          type = cell;
        }

        const mat = MATERIALS[type];
        if (mat && mat.color) {
          drawPixel(x, y, mat.color);
        }
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
  console.log("Selected material:", type);
  let particle = null;

  if (type === "erase") {
    particle = null;
  } else if (type === "fire") {
    particle = { type: "fire", age: 0 };
  } else if (type === "vine"){
    particle = { type: "vine" };
    console.log("Placed vine at", x, y);
  } else {
    particle = type;
  }

  if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
    grid[index(x, y)] = particle;
  }
});

loop();


