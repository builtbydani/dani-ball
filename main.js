const canvas = document.getElementById("sim");
const context = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

const grid = Array(width * height).fill(null);

const materialSelector = document.getElementById("material");

function index (x, y) {
  return y * width + x;
}

function drawPixel(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x, y, 1, 1);
}

function update() {
  for (let y = height - 2; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = index(x, y);
      const below = index(x, y + 1);

      if (grid[i] === "sand" && grid[below] === null) {
        grid[below] = "sand";
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
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.ClientY - rect.top);
  const type = materialSelector.value;

  if (x >= 0 && x < width && y >= 0 && y < height) {
    grid[index(x, y)] = type;
  }

  if (type === "erase") {
    grid[index(x, y)] = null;
  } else {
    grid[index(x, y)] = type;
  }
});

loop();
