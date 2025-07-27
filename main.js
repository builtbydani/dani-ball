// Daniball - particle sim inspired by Danball.jp
document.addEventListener("DOMContentLoaded", () => {
const GRID_WIDTH = 150;
const GRID_HEIGHT = 150;
const PIXEL_SIZE = 4;

const canvas = document.getElementById("sim");
canvas.width = GRID_WIDTH * PIXEL_SIZE;
canvas.height = GRID_HEIGHT * PIXEL_SIZE;
const context = canvas.getContext("2d");

const grid = Array(GRID_WIDTH * GRID_HEIGHT).fill(null);


const MATERIALS = {
  sand: { color: "#ffbd23", density: 2 },
  water: { color: "#4ebcff", density: 1 },
  wall: { color: "#bcbcbc", density: Infinity },
  fire: { color: "#ff4249", density: 0 },
  oil: { color: "#91482f", density: 0.8 },
  vine: { color: "#93fc68", density: 0 },
  acid: { color: "#49ff42", density: 0.9 },
  steel: { color: "#515154", density: Infinity },
  smoke: { color: "lightgray", density: 0 },
};

let selectedMaterial = "sand";

document.querySelectorAll(".material-btn").forEach(btn => {
  const color = btn.getAttribute("data-color");
  if (color) {
    btn.style.backgroundColor = color;
  }
  btn.addEventListener("click", () => {
    document.querySelectorAll(".material-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMaterial = btn.dataset.material;
  });
});

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

      if (type === "acid") {
        const below = index(x, y + 1);
        const left = x > 0 ? index(x - 1, y) : -1;
        const right = x < GRID_WIDTH - 1 ? index(x + 1, y) : -1;
        const downLeft = x > 0 ? index(x - 1, y + 1) : -1;
        const downRight = x < GRID_WIDTH - 1 ? index(x + 1, y + 1) : -1;

        const dirs = shuffle([below, downLeft, downRight, left, right]);

        for (const target of dirs) {
          if (target !== -1 && grid[target] === null) {
            grid[target] = "acid";
            grid[i] = null;
            break;
          }
        }

        const meltTargets = ["sand", "wall", "vine", "oil"];
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            const neighbor = index(nx, ny);
            const ni = index(nx, ny);
            if (ni === -1 || grid[ni] === null) continue;
            
            const nCell = grid[ni];
            const nType = (typeof nCell === "object") ? nCell.type : nCell;

            if (meltTargets.includes(nType)) {
              if (Math.random() < 0.1) {
                grid[ni] = "acid";
              } else {
                grid[ni] = null;
              }
            }
          }
        }
      }

     if (cell && typeof cell === "object" && cell.type === "vine") {
      cell.age = (cell.age || 0) + 1;
      if (cell.age > 45) continue; // Stop growing after a while

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

          if (neighbor === "oil") {
            grid[ni] = { type: "fire", age: 0 };
          }

          if (neighbor && typeof neighbor === "object" && neighbor.type === "vine") {
            if (Math.random() < 0.2) {
              grid[ni] = { type: "fire", age: 0 };
            }
          }
        }

        if (y > 0) {
              const above = index(x, y - 1);
              if (grid[above] === null && Math.random() < 0.4) {
                grid[above] = { type: "smoke", age: 0};
              }
        }

        if (cell.age >= FLAME_LIFESPAN) {
          grid[i] = null;
        }
      }
    }
  }

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const i = index(x, y);
      const cell = grid[i]; 
      if (cell && typeof cell === "object" && cell.type === "smoke") {
        cell.age++;
        const dx = Math.floor(Math.random() * 3) - 1;
        const nx = x + dx;
        const ny = y - 1;
        if (nx >= 0 && nx < GRID_WIDTH && ny >= 0) {
          const ni = index(nx, ny);
          if (grid[ni] === null) {
            grid[ni] = { type: "smoke", age: cell.age };
            grid[i] = null;
          }
        }

        if (cell.age > 20) {
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
  const type = selectedMaterial;
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

  const brushSize = (type === "wall" || type === "steel") 
    ? 5 
    : parseInt(document.getElementById("brush").value);

  for (let dx = -Math.floor(brushSize / 2); dx <= Math.floor(brushSize / 2); dx++) {
    for (let dy = -Math.floor(brushSize / 2); dy <= Math.floor(brushSize / 2); dy++) {
      const nx = x + dx;
      const ny = y + dy;
      const ni = index(nx, ny);
      if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
        if (type === "erase" || grid[ni] === null) {
          grid[ni] = (particle && typeof particle === "object")
            ? structuredClone(particle)
            : particle;
        }
      }
    }
  }
});

loop(); 

document.getElementById("clear-btn").addEventListener("click", () => {
  for (let i = 0; i < grid.length; i++) {
    grid[i] = null;
  }
});
});
