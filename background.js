/* Open the side panel when the toolbar icon is clicked where supported.
   The action also declares a popup (see manifest), which is the fallback
   drafting surface; both surfaces share draft-app.js. */
try {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }
} catch (e) { /* older Chrome: popup only */ }
