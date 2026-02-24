// Validate that a URL is a legitimate YouTube URL (HTTPS only)
function isYouTubeUrl(url) {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      /^(www\.)?(youtube\.com|youtu\.be)$/i.test(u.hostname)
    );
  } catch {
    return false;
  }
}

// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick);

function genericOnClick(info, tab) {
  console.log("Standard context menu item clicked.", info);

  // Validate URL before processing
  if (!info.linkUrl || !isYouTubeUrl(info.linkUrl)) {
    console.error("Invalid or non-YouTube URL — aborting.", info.linkUrl);
    return;
  }

  // MUST be immediate (user gesture)
  chrome.sidePanel.open({ windowId: tab.windowId });

  // Delay message so side panel has time to load
  setTimeout(() => {
    chrome.runtime.sendMessage(
      {
        action: "getSummary",
        data: {
          url: info.linkUrl,
          style: info.menuItemId,
        },
      },
      () => {
        // Prevent "Receiving end does not exist" crash
        if (chrome.runtime.lastError) {
          console.warn(
            "Side panel not ready yet:",
            chrome.runtime.lastError.message
          );
        }
      }
    );
  }, 700);
}

chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  let contexts = ["video", "link"];

  // Parent context menu for summarize video
  let parent = chrome.contextMenus.create({
    title: "Summarize video",
    contexts: contexts,
    id: contexts[0],
  });

  // Children context menus
  chrome.contextMenus.create({
    title: "TL;DR",
    contexts: contexts,
    parentId: parent,
    id: "tldr",
  });

  chrome.contextMenus.create({
    title: "Bullets + timestamps",
    contexts: contexts,
    parentId: parent,
    id: "bullets",
  });

  chrome.contextMenus.create({
    title: "Chapterized summary",
    contexts: contexts,
    parentId: parent,
    id: "chapters",
  });

  chrome.contextMenus.create({
    title: "Study notes",
    contexts: contexts,
    parentId: parent,
    id: "study",
  });

});
