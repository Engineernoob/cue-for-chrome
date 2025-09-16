interface Message {
  action: string;
  [key: string]: any;
}

interface SendResponse {
  (response?: any): void;
}

let overlayContainer: HTMLDivElement | null = null;

// Inject overlay.css into page <head>
function injectOverlayCSS(): void {
  if (document.getElementById("cue-overlay-css")) return;

  const link = document.createElement("link");
  link.id = "cue-overlay-css";
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("assets/overlay.css"); // vite builds here
  document.head.appendChild(link);
}

// Create overlay container and inject overlay bundle
function createOverlayContainer(): HTMLDivElement {
  injectOverlayCSS();

  const container = document.createElement("div");
  container.id = "cue-overlay-container";
  document.body.appendChild(container);

  // Load React overlay bundle (built to overlay/overlay.js)
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("overlay/overlay.js");
  script.type = "module";
  script.defer = true; // ensure runs after DOM is ready
  document.body.appendChild(script);

  return container;
}

// Toggle overlay on/off
function toggleOverlay(): void {
  if (overlayContainer) {
    overlayContainer.remove();
    overlayContainer = null;
    // Persist state
    chrome.storage.local.set({ overlayVisible: false });
    return;
  }
  overlayContainer = createOverlayContainer();
  // Persist state
  chrome.storage.local.set({ overlayVisible: true });
}

// Listen for background messages
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: SendResponse
  ) => {
    if (message.action === "toggleOverlay") {
      toggleOverlay();
      sendResponse({ status: "overlayToggled" });
    }
    if (message.action === "hideOverlay") {
      if (overlayContainer) {
        overlayContainer.remove();
        overlayContainer = null;
        chrome.storage.local.set({ overlayVisible: false });
      }
      sendResponse({ status: "overlayHidden" });
    }
    return true;
  }
);

// Restore overlay if user left it enabled
chrome.storage.local.get("overlayVisible", (data) => {
  if (data.overlayVisible) {
    toggleOverlay();
  }
});
