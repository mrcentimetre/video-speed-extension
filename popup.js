const STEP_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const PRESET_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

let currentSpeed = 1;
let currentHostname = null;

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

function sendDisableMessage(disabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "setDisabled", disabled }).catch(() => {});
    }
  });
}

function updateDisableUI(disabledSites, globallyDisabled) {
  const siteDisabled = currentHostname && disabledSites.includes(currentHostname);
  const isDisabled = globallyDisabled || siteDisabled;

  const siteBtn = document.getElementById("disableSiteBtn");
  const globalBtn = document.getElementById("disableGlobalBtn");
  const banner = document.getElementById("disabledBanner");
  const bannerText = document.getElementById("disabledBannerText");

  siteBtn.classList.toggle("active", siteDisabled);
  siteBtn.textContent = "";
  siteBtn.insertAdjacentHTML("afterbegin", `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/>
    </svg>
    ${siteDisabled ? "Enable for this site" : "Disable for this site"}
  `);

  globalBtn.classList.toggle("active", globallyDisabled);
  globalBtn.textContent = "";
  globalBtn.insertAdjacentHTML("afterbegin", `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
    ${globallyDisabled ? "Enable globally" : "Disable globally"}
  `);

  if (isDisabled) {
    banner.classList.add("show");
    if (globallyDisabled) {
      bannerText.textContent = "Extension disabled globally";
    } else {
      bannerText.textContent = `Extension disabled for ${currentHostname || "this site"}`;
    }
  } else {
    banner.classList.remove("show");
  }
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

  // Load saved speed + disable state
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0] && tabs[0].url) {
      try {
        currentHostname = new URL(tabs[0].url).hostname;
      } catch (e) {
        currentHostname = null;
      }
    }

    const siteBtn = document.getElementById("disableSiteBtn");
    if (!currentHostname) siteBtn.disabled = true;

    chrome.storage.sync.get(["videoSpeed", "globallyDisabled", "disabledSites"], data => {
      updateUI(data.videoSpeed ? parseFloat(data.videoSpeed) : 1);
      updateDisableUI(data.disabledSites || [], !!data.globallyDisabled);
    });
  });

  document.getElementById("decBtn").addEventListener("click", () => stepSpeed(-1));
  document.getElementById("incBtn").addEventListener("click", () => stepSpeed(1));
  document.getElementById("resetBtn").addEventListener("click", () => setSpeed(1));

  document.getElementById("disableSiteBtn").addEventListener("click", () => {
    if (!currentHostname) return;
    chrome.storage.sync.get(["disabledSites", "globallyDisabled"], data => {
      const sites = data.disabledSites || [];
      const idx = sites.indexOf(currentHostname);
      if (idx === -1) {
        sites.push(currentHostname);
      } else {
        sites.splice(idx, 1);
      }
      chrome.storage.sync.set({ disabledSites: sites }, () => {
        const globallyDisabled = !!data.globallyDisabled;
        const siteDisabled = sites.includes(currentHostname);
        sendDisableMessage(globallyDisabled || siteDisabled);
        updateDisableUI(sites, globallyDisabled);
      });
    });
  });

  document.getElementById("disableGlobalBtn").addEventListener("click", () => {
    chrome.storage.sync.get(["disabledSites", "globallyDisabled"], data => {
      const newGlobal = !data.globallyDisabled;
      chrome.storage.sync.set({ globallyDisabled: newGlobal }, () => {
        const sites = data.disabledSites || [];
        sendDisableMessage(newGlobal || (currentHostname && sites.includes(currentHostname)));
        updateDisableUI(sites, newGlobal);
      });
    });
  });
});
