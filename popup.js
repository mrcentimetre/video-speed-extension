const STEP_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const PRESET_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

let currentSpeed = 1;

function fmt(s) {
  return Number.isInteger(s) ? s + ".0" : String(s);
}

function updateUI(speed) {
  currentSpeed = speed;
  const el = document.getElementById("speedDisplay");
  el.textContent = fmt(speed);
  el.classList.toggle("accent", Math.abs(speed - 1) > 0.01);
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.toggle("active", Math.abs(parseFloat(btn.dataset.speed) - speed) < 0.01);
  });
}

function setSpeed(speed) {
  const s = Math.round(parseFloat(speed) * 100) / 100;
  updateUI(s);
  chrome.storage.sync.set({ videoSpeed: String(s) });
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "changeSpeed", speed: s });
  });
}

function stepSpeed(dir) {
  const i = STEP_SPEEDS.findIndex(s => Math.abs(s - currentSpeed) < 0.01);
  const ni = i === -1
    ? STEP_SPEEDS.indexOf(STEP_SPEEDS.reduce((p, c) =>
        Math.abs(c - currentSpeed) < Math.abs(p - currentSpeed) ? c : p))
    : i;
  setSpeed(STEP_SPEEDS[Math.max(0, Math.min(STEP_SPEEDS.length - 1, ni + dir))]);
}

document.addEventListener("DOMContentLoaded", () => {
  // Build preset buttons
  const grid = document.getElementById("presetsGrid");
  PRESET_SPEEDS.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "preset-btn";
    btn.dataset.speed = s;
    btn.textContent = s + "\u00d7";
    btn.addEventListener("click", () => setSpeed(s));
    grid.appendChild(btn);
  });

  // Load saved speed
  chrome.storage.sync.get(["videoSpeed"], data => {
    updateUI(data.videoSpeed ? parseFloat(data.videoSpeed) : 1);
  });

  document.getElementById("decBtn").addEventListener("click", () => stepSpeed(-1));
  document.getElementById("incBtn").addEventListener("click", () => stepSpeed(1));
  document.getElementById("resetBtn").addEventListener("click", () => setSpeed(1));
});
