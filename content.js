(function () {
  "use strict";

  const STEP_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6];
  const HIGH_SPEEDS  = [4, 5, 6];
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
    .__vsc-more-wrap { position: relative; }
    .__vsc-more {
      all: unset;
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,0.55);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 5px;
      padding: 3px 7px;
      cursor: pointer;
      line-height: 1.4;
      transition: all 0.12s;
    }
    .__vsc-more:hover { background: rgba(255,255,255,0.14); color: #fff; border-color: rgba(255,255,255,0.18); }
    .__vsc-more.__vsc-open { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.2); }
    .__vsc-more.__vsc-hi { background: linear-gradient(135deg, #3b82f6, #6366f1); border-color: transparent; color: #fff; }
    .__vsc-drop {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 0;
      background: rgba(8, 8, 14, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.6);
      opacity: 0;
      pointer-events: none;
      transform: translateY(4px);
      transition: opacity 0.15s, transform 0.15s;
      min-width: 70px;
    }
    .__vsc-drop.__vsc-open { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .__vsc-di {
      all: unset;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.65);
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.12s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .__vsc-di:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .__vsc-di.__vsc-active { background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; }
    .__vsc-close {
      all: unset;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      line-height: 1;
      color: rgba(255,255,255,0.3);
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.12s;
      flex-shrink: 0;
    }
    .__vsc-close:hover { background: rgba(220,50,50,0.2); color: rgba(255,100,100,0.9); }
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
    const isHigh = HIGH_SPEEDS.some(s => Math.abs(s - currentSpeed) < 0.01);
    controllers.forEach(ctrl => {
      ctrl.querySelector(".__vsc-spd").textContent = currentSpeed + "\u00d7";
      ctrl.querySelectorAll(".__vsc-p").forEach(b =>
        b.classList.toggle("__vsc-active", Math.abs(parseFloat(b.dataset.s) - currentSpeed) < 0.01)
      );
      ctrl.querySelectorAll(".__vsc-di").forEach(b =>
        b.classList.toggle("__vsc-active", Math.abs(parseFloat(b.dataset.s) - currentSpeed) < 0.01)
      );
      const more = ctrl.querySelector(".__vsc-more");
      if (more) {
        const isOpen = more.classList.contains("__vsc-open");
        more.textContent = isHigh ? currentSpeed + "\u00d7" : ("more " + (isOpen ? "\u25b4" : "\u25be"));
        more.classList.toggle("__vsc-hi", isHigh);
      }
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".__vsc-drop.__vsc-open").forEach(d => d.classList.remove("__vsc-open"));
    document.querySelectorAll(".__vsc-more.__vsc-open").forEach(b => b.classList.remove("__vsc-open"));
  }

  function makeController() {
    const isHigh = HIGH_SPEEDS.some(s => Math.abs(s - currentSpeed) < 0.01);
    const el = document.createElement("div");
    el.className = "__vsc";
    el.innerHTML = `
      <div class="__vsc-bar">
        <div class="__vsc-grip"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="__vsc-presets">
          ${PRESET_SPEEDS.map(s =>
            `<button class="__vsc-p${Math.abs(s - currentSpeed) < 0.01 ? " __vsc-active" : ""}" data-s="${s}">${s}\u00d7</button>`
          ).join("")}
          <div class="__vsc-more-wrap">
            <div class="__vsc-drop">
              ${[...HIGH_SPEEDS].reverse().map(s =>
                `<button class="__vsc-di${Math.abs(s - currentSpeed) < 0.01 ? " __vsc-active" : ""}" data-s="${s}">${s}\u00d7</button>`
              ).join("")}
            </div>
            <button class="__vsc-more${isHigh ? " __vsc-hi" : ""}">${isHigh ? currentSpeed + "\u00d7" : "more \u25be"}</button>
          </div>
        </div>
        <div class="__vsc-div"></div>
        <div class="__vsc-ctrl">
          <button class="__vsc-b" data-action="dec">\u2212</button>
          <span class="__vsc-spd">${currentSpeed}\u00d7</span>
          <button class="__vsc-b" data-action="inc">+</button>
        </div>
        <div class="__vsc-div"></div>
        <button class="__vsc-close" title="Hide controller">\u00d7</button>
      </div>`;

    el.querySelector('[data-action="dec"]').addEventListener("click", e => { e.stopPropagation(); stepSpeed(-1); });
    el.querySelector('[data-action="inc"]').addEventListener("click", e => { e.stopPropagation(); stepSpeed(1); });

    el.querySelectorAll(".__vsc-p").forEach(b =>
      b.addEventListener("click", e => { e.stopPropagation(); applySpeed(parseFloat(b.dataset.s)); })
    );

    const drop    = el.querySelector(".__vsc-drop");
    const moreBtn = el.querySelector(".__vsc-more");

    moreBtn.addEventListener("click", e => {
      e.stopPropagation();
      const isOpen = drop.classList.contains("__vsc-open");
      closeAllDropdowns();
      if (!isOpen) {
        drop.classList.add("__vsc-open");
        moreBtn.classList.add("__vsc-open");
      }
    });

    el.querySelectorAll(".__vsc-di").forEach(b =>
      b.addEventListener("click", e => {
        e.stopPropagation();
        applySpeed(parseFloat(b.dataset.s));
        closeAllDropdowns();
      })
    );

    // Close button — hides until the cursor leaves the video area and returns
    el.querySelector(".__vsc-close").addEventListener("click", e => {
      e.stopPropagation();
      closeAllDropdowns();
      el._suppressed = true;
      el.classList.remove("__vsc-show");
    });

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
        const inFullscreen = !!document.fullscreenElement;
        controllers.forEach((ctrl, video) => {
          if (ctrl._dragging) return; // keep visible while dragging

          if (inFullscreen) {
            // In fullscreen the video rect = entire screen, so the cursor is
            // always "over" it — use an inactivity timer instead.
            if (ctrl._suppressed) {
              // clear suppression after first mousemove in fullscreen
              ctrl._suppressed = false;
            }
            clearTimeout(ctrl._hideTimer);
            ctrl.classList.add("__vsc-show");
            ctrl._hideTimer = setTimeout(() => {
              if (!ctrl.matches(":hover")) ctrl.classList.remove("__vsc-show");
            }, 2500);
          } else {
            const r = video.getBoundingClientRect();
            const overVideo = e.clientX >= r.left && e.clientX <= r.right &&
                              e.clientY >= r.top  && e.clientY <= r.bottom;
            if (ctrl._suppressed) {
              // clear suppression once cursor leaves the video area
              if (!overVideo) ctrl._suppressed = false;
              return;
            }
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
          }
        });
      });
    }, { passive: true });

    // Hide all controllers when cursor leaves the page
    document.addEventListener("mouseleave", () => {
      controllers.forEach(ctrl => ctrl.classList.remove("__vsc-show"));
    });

    // Close dropdown when clicking anywhere outside it
    document.addEventListener("click", () => closeAllDropdowns());

    // Hide controllers immediately when entering fullscreen; they will
    // reappear as soon as the user moves the mouse.
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        controllers.forEach(ctrl => {
          clearTimeout(ctrl._hideTimer);
          ctrl.classList.remove("__vsc-show");
        });
      }
    });

    chrome.runtime.onMessage.addListener(msg => {
      if (msg.action === "changeSpeed") applySpeed(parseFloat(msg.speed), false);
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
