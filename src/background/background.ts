// Background service worker for cue-for-chrome extension
// Handles keyboard shortcuts, message passing, and AI API coordination

(function () {
  type TabId = number;

  // Helper: ensure content script is injected, then toggle overlay
  async function toggleOverlay(tabId: TabId): Promise<void> {
    chrome.tabs.sendMessage(
      tabId,
      { action: "toggleOverlay" },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "Content script unavailable, injecting now…",
            chrome.runtime.lastError.message
          );

          try {
            // Inject the content script dynamically
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ["contentScript.js"], // fixed path from Vite build
            });

            // Retry toggle after injection
            chrome.tabs.sendMessage(tabId, { action: "toggleOverlay" }, () => {
              chrome.storage.local.set({ overlayVisible: true });
            });
          } catch (injectErr) {
            console.error("Failed to inject content script:", injectErr);
          }
        } else if (response) {
          console.log("Overlay toggled successfully");

          // Toggle state persistence
          chrome.storage.local.get("overlayVisible", (data) => {
            const newState = !data.overlayVisible;
            chrome.storage.local.set({ overlayVisible: newState });
          });
        }
      }
    );
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

  // Handle messages from content script
  chrome.runtime.onMessage.addListener(
    (
      message: { action: string; [key: string]: any },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.action === "aiRequest") {
        if ((chrome as any).ai) {
          console.log("Chrome AI available");
          sendResponse({ status: "aiAvailable" });
        } else {
          console.warn(
            "Chrome AI not available - experimental feature may be disabled"
          );
          sendResponse({ status: "aiUnavailable" });
        }
      } else if (message.action === "checkOverlayState") {
        // Respond with persisted state
        chrome.storage.local.get("overlayVisible", (data) => {
          sendResponse({ showOverlay: data.overlayVisible || false });
        });
        return true; // keep channel open for async response
      }
      return true;
    }
  );

  // Log startup status
  chrome.runtime.onStartup.addListener(() => {
    console.log("Cue for Chrome extension started");
    if ((chrome as any).ai) {
      console.log("Chrome AI APIs available");
    } else {
      console.log(
        "Chrome AI APIs not available - ensure user has enabled experimental features in chrome://flags"
      );
    }
  });
})();
