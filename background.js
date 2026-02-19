chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ videoSpeed: "1.5" }); // Default speed
});
