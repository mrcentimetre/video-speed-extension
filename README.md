# Video Speed Controller

A lightweight Chrome extension that allows you to control video playback speed globally across all websites. Adjust playback speed from 0.5x to 3x with a single click.

![Chrome Extension](https://img.shields.io/badge/chrome-extension-blue)
![Manifest Version](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- 🎬 **Global Control** - Works on all websites with video content (YouTube, Vimeo, etc.)
- ⚡ **Quick Access** - Change speed with a single click from the toolbar
- 💾 **Persistent Settings** - Your preferred speed is saved and applied automatically
- 🌐 **Sync Across Devices** - Settings sync via Chrome Sync
- 📏 **Wide Range** - Speeds from 0.5x (slow motion) to 3x (ultra fast)

## Installation

### From Chrome Web Store (Coming Soon)

> This extension will be available on the Chrome Web Store soon.

### Manual Installation (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the folder containing this extension
6. The extension icon will appear in your toolbar

## Usage

1. Navigate to any webpage with video content
2. Click the Video Speed Controller icon in your Chrome toolbar
3. Select your desired playback speed from the dropdown
4. The video will immediately adjust to the selected speed

### Available Speeds

| Speed | Use Case |
|-------|----------|
| 0.5x | Slow motion - detailed analysis |
| 1x | Normal playback |
| 1.5x | **Default** - slightly faster |
| 2x | Double speed - quick viewing |
| 2.5x | Fast forward - skimming content |
| 3x | Maximum speed - rapid review |

## Project Structure

```
video-speed-extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── background.js      # Service worker for initialization
├── content.js         # Content script for video control
├── popup.html         # Popup UI structure
├── popup.js           # Popup logic and user interactions
├── icon.png           # Extension icon
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## How It Works

1. **Storage**: Uses `chrome.storage.sync` to save and persist your preferred playback speed
2. **Communication**: The popup sends messages to the content script via `chrome.tabs.sendMessage()`
3. **Video Control**: The content script finds all `<video>` elements on the page and sets their `playbackRate` property

## Development

### Modifying the Extension

After making changes to the code:

1. Go to `chrome://extensions/`
2. Find the Video Speed Controller extension
3. Click the **refresh** icon to reload the extension
4. Test your changes on a webpage with video content

### Debugging

- **Popup**: Right-click the popup and select "Inspect" to open DevTools
- **Content Script**: Open DevTools on any webpage and go to the Console tab
- **Service Worker**: Go to `chrome://extensions/`, click "service worker" under the extension

## Publishing to Chrome Web Store

1. Zip all extension files (excluding `.gitignore` and development files)
2. Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay the one-time $5 developer registration fee
4. Create a new item and upload your zip file
5. Fill in the store listing details (description, screenshots, etc.)
6. Submit for review

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Supported |
| Edge | ✅ Supported (Chromium-based) |
| Brave | ✅ Supported (Chromium-based) |
| Firefox | ❌ Not supported (requires manifest adaptation) |
| Safari | ❌ Not supported |

## Future Enhancements

- [ ] Keyboard shortcuts for quick speed adjustments
- [ ] Per-site speed preferences
- [ ] Custom speed input (fine-grained control)
- [ ] Speed indicator overlay on videos
- [ ] Picture-in-picture speed display
- [ ] Multiple video support on same page
- [ ] Speed reset button

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/yourusername/video-speed-extension/issues) on GitHub.

---

**Enjoy faster (or slower) video playback across the web!** 🎬
