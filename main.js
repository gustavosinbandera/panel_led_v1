let config = {};
let rowBuffers = [];
let brightness = [];
let display = [];
let scrollOffset = 0;
let wsConnected = false;
let lastReceivedMessage = "";

// Color base
let baseR = 255;
let baseG = 255;
let baseB = 0;

let scrollIntervalId;

const panel = document.getElementById("panel");
const rSlider = document.getElementById("r");
const gSlider = document.getElementById("g");
const bSlider = document.getElementById("b");
const speedSlider = document.getElementById("speed");

rSlider.addEventListener("input", () => baseR = parseInt(rSlider.value));
gSlider.addEventListener("input", () => baseG = parseInt(gSlider.value));
bSlider.addEventListener("input", () => baseB = parseInt(bSlider.value));
speedSlider.addEventListener("input", updateScrollSpeed);
let brightnessBoost = 1.0; // valor inicial global

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
  scrollOffset = 0;
}

function scrollFrame() {
  for (let y = 0; y < config.rows; y++) {
    for (let x = 0; x < config.cols; x++) {
      const srcX = (scrollOffset + x) % rowBuffers[y].length;
      const bit = rowBuffers[y][srcX];
      if (bit === 1) {
        const sliderVal = parseInt(speedSlider.value);
        const sliderMin = 5;
        const sliderMax = 200;
        const brightnessBoost = 1.0 + ((sliderVal - sliderMin) / (sliderMax - sliderMin)) * (3.5 - 1.0);
        brightness[y][x] = brightnessBoost;
      }
    }
  }
  scrollOffset++;
}

function updateScrollSpeed() {
  const newInterval = parseInt(speedSlider.value);

  // Interpolación lineal para ajustar el brillo de acuerdo a la velocidad
  const sliderMin = 50;
  const sliderMax = 200;
  brightnessBoost = 1.0 + ((newInterval - sliderMin) / (sliderMax - sliderMin)) * (3.5 - 1.0);

  // Actualiza solo si cambió
  if (scrollIntervalId) clearInterval(scrollIntervalId);
  scrollIntervalId = setInterval(scrollFrame, newInterval);
}

// function drawFadeFrame() {
//   for (let y = 0; y < config.rows; y++) {
//     for (let x = 0; x < config.cols; x++) {
//       const idx = y * config.cols + x;
//       let b = brightness[y][x];
//       const led = display[idx];

//       if (b > 0) {
//         b = Math.max(0, b - config.decay);
//         brightness[y][x] = b;

//         const r = Math.round(baseR * b);
//         const g = Math.round(baseG * b);
//         const bl = Math.round(baseB * b);

//         led.style.backgroundColor = `rgb(${r},${g},${bl})`;
//         led.style.boxShadow = `0 0 ${6 + 8 * b}px rgba(${r},${g},${bl},${b})`;
//       } else {
//         led.style.backgroundColor = "#220000";
//         led.style.boxShadow = "0 0 6px #100000 inset";
//       }
//     }
//   }

//   requestAnimationFrame(drawFadeFrame);
// }

function drawFadeFrame() {
  // Interpolar decay en función del scrollSpeed:
  // scroll rápido (5ms) → decay alto (0.25), scroll lento (100ms) → decay bajo (0.08)
  const minSpeed = 50;
  const maxSpeed = 100;
  const minDecay = 0.01;
  const maxDecay = 0.09;

  const speed = parseInt(document.getElementById("speedSlider")?.value || config.scrollSpeed);
  const t = (speed - minSpeed) / (maxSpeed - minSpeed);  // normalizado entre 0 y 1
  const dynamicDecay = maxDecay - (maxDecay - minDecay) * t;

  for (let y = 0; y < config.rows; y++) {
    for (let x = 0; x < config.cols; x++) {
      const idx = y * config.cols + x;
      let b = brightness[y][x];
      const led = display[idx];

      if (b > 0) {
        b = Math.max(0, b - dynamicDecay);
        brightness[y][x] = b;

        const r = Math.round(baseR * b);
        const g = Math.round(baseG * b);
        const bl = Math.round(baseB * b);

        led.style.backgroundColor = `rgb(${r},${g},${bl})`;
        led.style.boxShadow = `0 0 ${0 + 8 * b}px rgba(${r},${g},${bl},${b})`;
      } else {
        led.style.backgroundColor = "#220000";
        led.style.boxShadow = "0 0 6px #100000 inset";
      }
    }
  }

  requestAnimationFrame(drawFadeFrame);
}

function setupWebSocket() {
  const socket = new WebSocket("ws://192.168.80.13/ws");

  socket.onopen = () => {
    console.log("[WS] Connected to ESP32");
    wsConnected = true;
  };

  socket.onclose = () => {
    console.warn("[WS] Disconnected from ESP32");
    wsConnected = false;
    if (!lastReceivedMessage || lastReceivedMessage === config.message) {
      buildBuffers(config.message, font, config.rows);
    }
  };

  socket.onerror = err => console.error("[WS] Error", err);

  socket.onmessage = event => {
    const newMessage = event.data.trim().toUpperCase();
    if (wsConnected && newMessage && newMessage !== lastReceivedMessage) {
      lastReceivedMessage = newMessage;
      buildBuffers(newMessage, font, config.rows);
    }
  };
}

fetch("config.json")
  .then(response => response.json())
  .then(data => {
    config = data;
    baseR = config.defaultColor.r;
    baseG = config.defaultColor.g;
    baseB = config.defaultColor.b;

    rSlider.value = baseR;
    gSlider.value = baseG;
    bSlider.value = baseB;
    speedSlider.value = config.scrollSpeed;

    initPanel(config);
    buildBuffers(config.message, font, config.rows);

    setupWebSocket();
    updateScrollSpeed();
    requestAnimationFrame(drawFadeFrame);
  })
  .catch(err => console.error("Error loading config.json:", err));
