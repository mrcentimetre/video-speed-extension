function setVideoSpeed(speed) {
    document.querySelectorAll("video").forEach(video => {
        video.playbackRate = parseFloat(speed);
    });
}

// Listen for speed change messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "changeSpeed") {
        setVideoSpeed(message.speed);
    }
});

// Apply saved speed on page load
chrome.storage.sync.get(["videoSpeed"], function (data) {
    if (data.videoSpeed) {
        setVideoSpeed(data.videoSpeed);
    }
});
