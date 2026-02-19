document.addEventListener("DOMContentLoaded", function () {
    const speedSelector = document.getElementById("speedSelector");

    // Load saved speed
    chrome.storage.sync.get(["videoSpeed"], function (data) {
        if (data.videoSpeed) {
            speedSelector.value = data.videoSpeed;
        }
    });

    // Save new speed and apply it
    speedSelector.addEventListener("change", function () {
        const speed = speedSelector.value;
        chrome.storage.sync.set({ videoSpeed: speed });

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "changeSpeed", speed: speed });
        });
    });
});
