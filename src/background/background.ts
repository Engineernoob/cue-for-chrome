// Background service worker for cue-for-chrome extension
// Handles keyboard shortcuts, message passing, and AI API coordination

(function() {
  // Helper types (using Chrome APIs)
  type TabId = number;

  // Helper: toggle overlay with safe injection
  async function toggleOverlay(tabId: TabId): Promise<void> {
    chrome.tabs.sendMessage(tabId, { action: "toggleOverlay" }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script should be auto-injected; log if missing (e.g., CSP block)
        console.error("Content script unavailable:", chrome.runtime.lastError.message);
      } else if (response) {
        console.log("Overlay toggled successfully");
      }
    });
  }


  // Listen for the toggle-overlay command (Cmd/Ctrl+Shift+U)
  chrome.commands.onCommand.addListener(async (command: string) => {
    if (command === "toggle-overlay") {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab?.id) {
          await toggleOverlay(tab.id);
        }
      } catch (error) {
        console.error("Error toggling overlay:", error);
      }
    }
  });

  // Toolbar icon click → also toggle overlay
  chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
    if (tab.id) {
      await toggleOverlay(tab.id);
    }
  });


  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(
    (
      message: { action: string; [key: string]: any },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.action === "aiRequest") {
        // Improved: Safer check for experimental Chrome AI
        if ((chrome as any).ai) {
          console.log("Chrome AI available");
          sendResponse({ status: "aiAvailable" });
        } else {
          console.warn("Chrome AI not available - experimental feature may be disabled");
          sendResponse({ status: "aiUnavailable" });
        }
      } else if (message.action === "checkOverlayState") {
        // Added: Respond to content script's state check (prevents unhandled rejection)
        sendResponse({ showOverlay: false }); // Default: don't show on load; manage via storage if needed
      }
      return true; // Keep message channel open for async response
    }
  );


  // Log startup status
  chrome.runtime.onStartup.addListener(async () => {
    console.log("Cue for Chrome extension started");
    // Improved: Safer AI check
    if ((chrome as any).ai) {
      console.log("Chrome AI APIs available");
    } else {
      console.log(
        "Chrome AI APIs not available - ensure user has enabled experimental features in chrome://flags"
      );
    }
  });

})();
