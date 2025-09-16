import { createRoot, Root } from "react-dom/client";
import Overlay from "@/overlay/Overlay";

interface Message {
  action: string;
  [key: string]: any;
}

interface SendResponse {
  (response?: any): void;
}

// Global overlay refs
let overlayContainer: HTMLDivElement | null = null;
let overlayRoot: Root | null = null;

// Inject overlay.css into page <head>
function injectOverlayCSS(): void {
  const existingLink = document.getElementById(
    "cue-overlay-css"
  ) as HTMLLinkElement;
  if (existingLink) return; // already injected

  const link = document.createElement("link");
  link.id = "cue-overlay-css";
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("assets/overlay.css"); // Vite outputs here
  document.head.appendChild(link);
}

// Function to create overlay container + mount React
function createOverlayContainer(): HTMLDivElement {
  injectOverlayCSS(); // ensure styles are loaded

  const container = document.createElement("div");
  container.id = "cue-overlay-container";
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    height: 500px;
    z-index: 2147483647;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    pointer-events: auto;
  `;

  document.body.appendChild(container);

  // Mount React Overlay
  overlayRoot = createRoot(container);
  overlayRoot.render(<Overlay />);

  return container;
}

// Function to toggle overlay
function toggleOverlay(): void {
  if (overlayContainer) {
    // Remove if it already exists
    overlayRoot?.unmount();
    overlayContainer.remove();
    overlayContainer = null;
    overlayRoot = null;
    return;
  }

  // Create + render if none exists
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
        overlayRoot?.unmount();
        overlayContainer.remove();
        overlayContainer = null;
        overlayRoot = null;
      }
      sendResponse({ status: "overlayHidden" });
    }
    return true;
  }
);

// Optional: restore overlay if extension says it should start visible
chrome.runtime.sendMessage({ action: "checkOverlayState" }, (response: any) => {
  if (response?.showOverlay) {
    toggleOverlay();
  }
});
