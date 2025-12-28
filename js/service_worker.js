// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick);

function genericOnClick(info, tab) {
  console.log("Standard context menu item clicked.", info);

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

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  chrome.contextMenus.create(
    { title: "Oops", parentId: 999, id: "errorItem" },
    function () {
      if (chrome.runtime.lastError) {
        console.log("Got expected error: " + chrome.runtime.lastError.message);
      }
    }
  );
});
