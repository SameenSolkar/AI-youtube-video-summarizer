// UI wiring
const urlEl = document.getElementById("url");
let outEl = document.getElementById("out");

const styleEl = document.getElementById("style");

// Basic YouTube URL check
function isYouTubeUrl(u) {
  return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/i.test(
    u
  );
}

// Open side panel and send message to it (video url and style of summary)
document.getElementById("summarize").addEventListener("click", async () => {
  try {
    const url = urlEl.value.trim();

    if (!isYouTubeUrl(url)) {
      throw new Error("Please paste a valid YouTube URL.");
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab.windowId });

    // Summary style
    const style = styleEl.value;

    // Close the popup window
    setTimeout(() => {
      // Close popup and open side panel via background script
      chrome.runtime.sendMessage({
        action: "getSummary",
        data: { url, style },
      });

      window.close();
    }, 500);
  } catch (error) {
    outEl.style.color = "red";
    outEl.innerText = error.message;
  }
});

// Autofill current tab’s URL if it’s a YouTube watch page
(async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && typeof tab.url === "string" && isYouTubeUrl(tab.url)) {
      urlEl.value = tab.url;
    }
  } catch {
    // ignore
  }
})();
