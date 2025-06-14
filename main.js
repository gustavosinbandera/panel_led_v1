

const message = "   ESP32 ESPRESSIF RGB LED MATRIX DISPLAY DEMO   ";
const cols = 64;
const rows = 8;
const panel = document.getElementById("panel");
const display = [];
const brightness = [];

for (let y = 0; y < rows; y++) {
  const row = [];
  for (let x = 0; x < cols; x++) {
    const led = document.createElement("div");
    led.classList.add("led");
    panel.appendChild(led);
    display.push(led);
    row.push(0);
  }
  brightness.push(row);
}

const rowBuffers = Array.from({ length: rows }, () => []);
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

let scrollOffset = 0
let lastScrollTime = 0;
const speed = 30;
const decay = 0.1;

const rSlider = document.getElementById("r");
const gSlider = document.getElementById("g");
const bSlider = document.getElementById("b");

function drawFrame(timestamp) {
  if (timestamp - lastScrollTime >= speed) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
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

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x;
      let b = brightness[y][x];

      if (b > 0) {
        b = Math.max(0, b - decay);
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

requestAnimationFrame(drawFrame);

