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
  // NOTE: vite outputs overlay.css under assets/
  link.href = chrome.runtime.getURL("assets/overlay.css");
  document.head.appendChild(link);
}

// Create overlay container and inject overlay bundle
function createOverlayContainer(): HTMLDivElement {
  injectOverlayCSS();

  const container = document.createElement("div");
  container.id = "cue-overlay-container";
  document.body.appendChild(container);

  // Load React overlay bundle (Vite builds it to overlay/overlay.js)
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("overlay/overlay.js");
  script.type = "module";
  document.body.appendChild(script); // append to body, not inside container

  return container;
}

// Toggle overlay on/off
function toggleOverlay(): void {
  if (overlayContainer) {
    overlayContainer.remove();
    overlayContainer = null;
    return;
  }
  overlayContainer = createOverlayContainer();
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
      }
      sendResponse({ status: "overlayHidden" });
    }
    return true;
  }
);

// Restore overlay if needed
chrome.runtime.sendMessage({ action: "checkOverlayState" }, (response: any) => {
  if (response?.showOverlay) {
    toggleOverlay();
  }
});
