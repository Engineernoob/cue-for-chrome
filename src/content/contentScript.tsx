interface Message {
  action: string;
  [key: string]: any;
}

interface SendResponse {
  (response?: any): void;
}

// Global overlay container reference
let overlayContainer: HTMLDivElement | null = null;

// Inject overlay.css into page <head>
function injectOverlayCSS(): void {
  const existingLink = document.getElementById(
    "cue-overlay-css"
  ) as HTMLLinkElement;
  if (existingLink) return;

  const link = document.createElement("link");
  link.id = "cue-overlay-css";
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("assets/overlay.css"); // built by Vite
  document.head.appendChild(link);
}

// Function to create overlay container
function createOverlayContainer(): HTMLDivElement {
  injectOverlayCSS();

  const container = document.createElement("div");
  container.id = "cue-overlay-container";
  document.body.appendChild(container);

  // Load React overlay bundle (built from index.tsx)
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("overlay.js");
  script.type = "module";
  container.appendChild(script);

  return container;
}

// Toggle overlay
function toggleOverlay(): void {
  if (overlayContainer) {
    overlayContainer.remove();
    overlayContainer = null;
    return;
  }
  overlayContainer = createOverlayContainer();
}

// Message listener from background script
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
