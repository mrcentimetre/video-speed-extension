# Video Speed Controller

A lightweight Chrome extension to control video playback speed across all websites. Hover over any video to get an **inline floating controller** — no toolbar clicking needed.

![Chrome Extension](https://img.shields.io/badge/chrome-extension-blue)
![Manifest Version](https://img.shields.io/badge/manifest-v3-green)
![Version](https://img.shields.io/badge/version-2.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- 🎬 **Inline Floating Controller** — hover over any video to reveal a speed bar directly on the player
- 🖱️ **Draggable Controller** — drag it anywhere on screen so it never blocks important content
- ⚡ **Preset Speeds** — one-click presets: 0.5×, 1×, 1.25×, 1.5×, 2×, 3×
- ➕➖ **Fine Step Control** — step through speeds in increments (0.25 → 0.5 → 0.75 … 3×)
- 🔄 **Reset Button** — jump back to 1× from the popup instantly
- 💾 **Persistent Settings** — your speed is saved and applied automatically on every page load
- 🌐 **Sync Across Devices** — settings sync via Chrome Sync
- 📺 **Works Everywhere** — YouTube, Vimeo, Netflix, Twitch, and any site with a `<video>` element
- 🎭 **Multiple Videos** — each video on the page gets its own controller

## Installation

### Manual Installation (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the folder containing this extension
6. The extension icon will appear in your toolbar

### Updating After Code Changes

1. Go to `chrome://extensions/`
2. Find **Video Speed Controller**
3. Click the **reload** (↻) icon
4. Refresh any open tabs you want the changes to apply to

## Usage

### Inline Controller (recommended)

1. Navigate to any page with a video
2. **Hover over the video** — the speed controller appears at the bottom-left
3. Click a preset (0.5×, 1×, 1.25×, 1.5×, 2×, 3×) or use **−** / **+** to step through speeds
4. **Drag the bar** anywhere on screen if it overlaps content you need to see
5. Move your cursor away from the video — the controller fades out automatically

### Popup (toolbar icon)

1. Click the extension icon in the Chrome toolbar
2. Select a preset from the grid, or use **−** / **+** / **Reset 1×**
3. The speed updates instantly on the active tab

### Available Speeds

| Preset | Step ladder |
|--------|-------------|
| 0.5× | 0.25× |
| 1× | 0.5× |
| 1.25× | 0.75× |
| 1.5× | 1× |
| 2× | 1.25× |
| 3× | 1.5×, 1.75×, 2×, 2.5×, 3× |

The **−** and **+** buttons step through every value in the step ladder column.

## Project Structure

```
video-speed-extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js      # Service worker — sets default speed on install
├── content.js         # Injects floating controller on every page
├── popup.html         # Toolbar popup UI
├── popup.js           # Popup logic
├── icon.png           # Extension icon
└── README.md          # This file
```

## How It Works

1. **Storage** — `chrome.storage.sync` saves your speed and syncs it across devices
2. **Floating controller** — `content.js` injects a fixed-position bar for each `<video>` found on the page; a `MutationObserver` catches videos added dynamically (e.g. YouTube SPA navigation)
3. **Overlay-safe hover detection** — sites like YouTube place a large invisible div on top of `<video>`, which blocks standard `mouseenter` events. The controller uses a global `mousemove` listener that checks raw cursor coordinates against each video's bounding rect, bypassing any overlay
4. **Drag** — the bar stores its dragged position and stops auto-repositioning once the user has moved it
5. **Sync** — the popup sends a `chrome.tabs.sendMessage` to the content script so changes apply immediately without a page reload

## Debugging

- **Popup** — right-click the popup → Inspect
- **Content script** — open DevTools on any page → Console tab (filter by `__vsc`)
- **Service Worker** — `chrome://extensions/` → click "service worker" link under the extension

## Publishing to Chrome Web Store

1. Zip all extension files (exclude `.gitignore`, `README.md`, and any dev files)
2. Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time $5 developer registration fee (if not already done)
4. Create a new item and upload the zip
5. Fill in the store listing (description, screenshots, category)
6. Submit for review

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Supported |
| Edge | ✅ Supported (Chromium-based) |
| Brave | ✅ Supported (Chromium-based) |
| Firefox | ❌ Not supported (different extension API) |
| Safari | ❌ Not supported |

## Roadmap

- [ ] Keyboard shortcuts (`<` / `>`) for speed control without touching the mouse
- [ ] Per-domain speed memory (e.g. YouTube always opens at 1.5×)
- [ ] Custom speed input — type any value like 1.8×
- [ ] Scroll wheel on the floating controller to adjust speed
- [ ] Picture-in-Picture button on the floating controller
- [ ] Speed badge on the extension toolbar icon

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/yourusername/video-speed-extension/issues) on GitHub.

---

**Enjoy faster (or slower) video playback across the web!** 🎬
