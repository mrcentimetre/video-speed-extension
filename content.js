(function () {
  "use strict";

  const STEP_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  const PRESET_SPEEDS = [0.5, 1, 1.25, 1.5, 2, 3];
  let currentSpeed = 1;
  const controllers = new Map(); // video -> controller element

  const CSS = `
    .__vsc {
      position: fixed;
      z-index: 2147483647;
      pointer-events: none;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .__vsc.__vsc-show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .__vsc-bar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 8px;
      background: rgba(8, 8, 14, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04) inset;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      white-space: nowrap;
      user-select: none;
      cursor: grab;
    }
    .__vsc-bar.__vsc-dragging { cursor: grabbing; }
    .__vsc-grip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5px;
      width: 9px;
      flex-shrink: 0;
      opacity: 0.3;
      transition: opacity 0.15s;
      padding: 1px 0;
      margin-right: 1px;
    }
    .__vsc-bar:hover .__vsc-grip { opacity: 0.6; }
    .__vsc-grip > i {
      display: block;
      width: 2.5px;
      height: 2.5px;
      border-radius: 50%;
      background: #fff;
    }
    .__vsc-presets { display: flex; gap: 3px; }
    .__vsc-p {
      all: unset;
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 5px;
      padding: 3px 7px;
      cursor: pointer;
      line-height: 1.4;
      transition: all 0.12s;
    }
    .__vsc-p:hover {
      background: rgba(255,255,255,0.14);
      color: #fff;
      border-color: rgba(255,255,255,0.18);
    }
    .__vsc-p.__vsc-active {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border-color: transparent;
      color: #fff;
    }
    .__vsc-div {
      width: 1px;
      height: 16px;
      background: rgba(255,255,255,0.12);
      margin: 0 2px;
      flex-shrink: 0;
    }
    .__vsc-ctrl { display: flex; align-items: center; gap: 3px; }
    .__vsc-b {
      all: unset;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      color: rgba(255,255,255,0.7);
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.12s;
      flex-shrink: 0;
    }
    .__vsc-b:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .__vsc-spd {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      min-width: 38px;
      text-align: center;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 2px 5px;
      line-height: 1.5;
    }
  `;

  function injectCSS() {
    if (document.getElementById("__vsc_style__")) return;
    const s = document.createElement("style");
    s.id = "__vsc_style__";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function applySpeed(speed, persist = true) {
    currentSpeed = Math.round(parseFloat(speed) * 100) / 100;
    document.querySelectorAll("video").forEach(v => (v.playbackRate = currentSpeed));
    if (persist) chrome.storage.sync.set({ videoSpeed: String(currentSpeed) });
    syncControllers();
  }

  function stepSpeed(dir) {
    const i = STEP_SPEEDS.findIndex(s => Math.abs(s - currentSpeed) < 0.01);
    const ni = i === -1
      ? STEP_SPEEDS.indexOf(STEP_SPEEDS.reduce((p, c) =>
          Math.abs(c - currentSpeed) < Math.abs(p - currentSpeed) ? c : p))
      : i;
    applySpeed(STEP_SPEEDS[Math.max(0, Math.min(STEP_SPEEDS.length - 1, ni + dir))]);
  }

  function syncControllers() {
    controllers.forEach(ctrl => {
      ctrl.querySelector(".__vsc-spd").textContent = currentSpeed + "\u00d7";
      ctrl.querySelectorAll(".__vsc-p").forEach(b =>
        b.classList.toggle("__vsc-active", Math.abs(parseFloat(b.dataset.s) - currentSpeed) < 0.01)
      );
    });
  }

  function makeController() {
    const el = document.createElement("div");
    el.className = "__vsc";
    el.innerHTML = `<div class="__vsc-bar">
      <div class="__vsc-grip"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="__vsc-presets">
        ${PRESET_SPEEDS.map(s =>
          `<button class="__vsc-p${Math.abs(s - currentSpeed) < 0.01 ? " __vsc-active" : ""}" data-s="${s}">${s}\u00d7</button>`
        ).join("")}
      </div>
      <div class="__vsc-div"></div>
      <div class="__vsc-ctrl">
        <button class="__vsc-b" data-action="dec">\u2212</button>
        <span class="__vsc-spd">${currentSpeed}\u00d7</span>
        <button class="__vsc-b" data-action="inc">+</button>
      </div>
    </div>`;

    el.querySelector('[data-action="dec"]').addEventListener("click", e => { e.stopPropagation(); stepSpeed(-1); });
    el.querySelector('[data-action="inc"]').addEventListener("click", e => { e.stopPropagation(); stepSpeed(1); });
    el.querySelectorAll(".__vsc-p").forEach(b =>
      b.addEventListener("click", e => { e.stopPropagation(); applySpeed(parseFloat(b.dataset.s)); })
    );
    return el;
  }

  function place(ctrl, video) {
    if (ctrl._userPositioned) return; // user dragged it — don't override their position
    const r = video.getBoundingClientRect();
    if (r.width < 80 || r.height < 45) return;
    ctrl.style.left = `${r.left + 10}px`;
    ctrl.style.bottom = `${window.innerHeight - r.bottom + 10}px`;
  }

  function makeDraggable(ctrl) {
    const bar = ctrl.querySelector(".__vsc-bar");
    let dragging = false;
    let startX, startY, origLeft, origBottom;

    bar.addEventListener("mousedown", e => {
      if (e.target.closest("button")) return; // let button clicks pass through
      dragging = true;
      ctrl._dragging = true;
      ctrl._userPositioned = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseInt(ctrl.style.left) || 0;
      origBottom = parseInt(ctrl.style.bottom) || 10;
      bar.classList.add("__vsc-dragging");
      document.body.style.userSelect = "none";
      e.preventDefault();
    });

    document.addEventListener("mousemove", e => {
      if (!dragging) return;
      const newLeft = Math.max(0, Math.min(
        window.innerWidth - ctrl.offsetWidth,
        origLeft + (e.clientX - startX)
      ));
      const newBottom = Math.max(0, Math.min(
        window.innerHeight - ctrl.offsetHeight,
        origBottom - (e.clientY - startY)
      ));
      ctrl.style.left = `${newLeft}px`;
      ctrl.style.bottom = `${newBottom}px`;
    });

    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      ctrl._dragging = false;
      bar.classList.remove("__vsc-dragging");
      document.body.style.userSelect = "";
    });
  }

  function attach(video) {
    if (controllers.has(video)) return;
    const ctrl = makeController();
    document.documentElement.appendChild(ctrl);
    controllers.set(video, ctrl);
    place(ctrl, video);
    makeDraggable(ctrl);
    // Hover is handled globally via mousemove (see init) because sites like
    // YouTube place an overlay div on top of the <video> element, preventing
    // mouseenter/mouseleave from ever firing on the video itself.
  }

  function scan() {
    document.querySelectorAll("video").forEach(attach);
    controllers.forEach((ctrl, video) => {
      if (!video.isConnected) { ctrl.remove(); controllers.delete(video); }
    });
  }

  function reposition() {
    controllers.forEach((ctrl, video) => place(ctrl, video));
  }

  function init() {
    injectCSS();
    chrome.storage.sync.get(["videoSpeed"], d => {
      if (d.videoSpeed) {
        currentSpeed = parseFloat(d.videoSpeed);
        document.querySelectorAll("video").forEach(v => (v.playbackRate = currentSpeed));
        syncControllers(); // fix already-built controllers that used the default speed
      }
      scan();
    });

    new MutationObserver(scan).observe(document, { childList: true, subtree: true });
    window.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    setInterval(reposition, 400);

    // Global hover detection — works even when an overlay covers the <video>
    // (YouTube, Twitch, etc. all do this). Throttled via rAF to ~60fps.
    let rafPending = false;
    document.addEventListener("mousemove", e => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        controllers.forEach((ctrl, video) => {
          if (ctrl._dragging) return; // keep visible while dragging
          const r = video.getBoundingClientRect();
          const overVideo = e.clientX >= r.left && e.clientX <= r.right &&
                            e.clientY >= r.top  && e.clientY <= r.bottom;
          if (overVideo || ctrl.matches(":hover")) {
            clearTimeout(ctrl._hideTimer);
            place(ctrl, video);
            ctrl.classList.add("__vsc-show");
          } else {
            clearTimeout(ctrl._hideTimer);
            ctrl._hideTimer = setTimeout(() => {
              if (!ctrl.matches(":hover")) ctrl.classList.remove("__vsc-show");
            }, 600);
          }
        });
      });
    }, { passive: true });

    // Hide all controllers when cursor leaves the page
    document.addEventListener("mouseleave", () => {
      controllers.forEach(ctrl => ctrl.classList.remove("__vsc-show"));
    });

    chrome.runtime.onMessage.addListener(msg => {
      if (msg.action === "changeSpeed") applySpeed(parseFloat(msg.speed), false);
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
