let config = {};
let rowBuffers = [];
let brightness = [];
let display = [];
let scrollOffset = 0;
let lastScrollTime = 0;

const panel = document.getElementById("panel");
const rSlider = document.getElementById("r");
const gSlider = document.getElementById("g");
const bSlider = document.getElementById("b");

function initPanel(config) {
  panel.style.gridTemplateColumns = `repeat(${config.cols}, ${config.ledSize}px)`;
  panel.style.gridTemplateRows = `repeat(${config.rows}, ${config.ledSize}px)`;
  panel.style.gap = `${config.gap}px`;

  for (let y = 0; y < config.rows; y++) {
    const row = [];
    for (let x = 0; x < config.cols; x++) {
      const led = document.createElement("div");
      led.classList.add("led");
      led.style.width = `${config.ledSize}px`;
      led.style.height = `${config.ledSize}px`;
      panel.appendChild(led);
      display.push(led);
      row.push(0);
    }
    brightness.push(row);
  }
}

function buildBuffers(message, font, rows) {
  rowBuffers = Array.from({ length: rows }, () => []);
  for (const char of message) {
    const glyph = font[char.toUpperCase()] || font[' '];
    for (let bit = 7; bit >= 0; bit--) {
      for (let row = 0; row < rows; row++) {
        const byte = glyph[row];
        const bitVal = (byte >> bit) & 1;
        rowBuffers[row].push(bitVal);
      }
    }
  }
}

function drawFrame(timestamp) {
  if (timestamp - lastScrollTime >= config.scrollSpeed) {
    for (let y = 0; y < config.rows; y++) {
      for (let x = 0; x < config.cols; x++) {
        const srcX = (scrollOffset + x) % rowBuffers[y].length;
        const bit = rowBuffers[y][srcX];
        if (bit === 1) brightness[y][x] = 1.0;
      }
    }

    scrollOffset = (scrollOffset + 1) % rowBuffers[0].length;
    lastScrollTime = timestamp;
  }

  const baseR = parseInt(rSlider.value);
  const baseG = parseInt(gSlider.value);
  const baseB = parseInt(bSlider.value);

  for (let y = 0; y < config.rows; y++) {
    for (let x = 0; x < config.cols; x++) {
      const idx = y * config.cols + x;
      let b = brightness[y][x];

      if (b > 0) {
        b = Math.max(0, b - config.decay);
        brightness[y][x] = b;

        const r = Math.round(baseR * b);
        const g = Math.round(baseG * b);
        const bl = Math.round(baseB * b);
        const led = display[idx];

        led.style.backgroundColor = `rgb(${r},${g},${bl})`;
        led.style.boxShadow = `0 0 ${6 + 8 * b}px rgba(${r},${g},${bl},${b})`;
      } else {
        display[idx].style.backgroundColor = "#220000";
        display[idx].style.boxShadow = "0 0 6px #100000 inset";
      }
    }
  }

  requestAnimationFrame(drawFrame);
}

fetch("config.json")
  .then(response => response.json())
  .then(data => {
    config = data;
    rSlider.value = config.defaultColor.r;
    gSlider.value = config.defaultColor.g;
    bSlider.value = config.defaultColor.b;

    initPanel(config);
    buildBuffers(config.message, font, config.rows);
    requestAnimationFrame(drawFrame);
  })
  .catch(err => console.error("Error loading config.json:", err));
