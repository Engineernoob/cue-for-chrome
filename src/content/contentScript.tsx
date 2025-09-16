interface Message {
  action: string;
  [key: string]: any;
}

interface SendResponse {
  (response?: any): void;
}

// Global overlay container reference
let overlayContainer: HTMLDivElement | null = null;

// Function to create overlay container
function createOverlayContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'cue-overlay-container';
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
    display: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    pointer-events: auto;
  `;
  
  // To make it "invisible" to screen-sharing (basic approach: high z-index, but for true invisibility,
  // could use CSS like @supports not (display: contents) or canvas, but start simple)
  container.style.setProperty('isolation', 'isolate'); // Isolate from parent styles
  
  // Placeholder content until React is mounted
  const placeholder = document.createElement('div');
  placeholder.style.cssText = 'padding: 20px; text-align: center; color: #666;';
  placeholder.textContent = 'Cue Overlay Loading... (React will mount here)';
  container.appendChild(placeholder);
  
  document.body.appendChild(container);
  return container;
}

// Function to toggle overlay visibility
function toggleOverlay(): void {
  if (!overlayContainer) {
    overlayContainer = createOverlayContainer();
  }
  
  if (overlayContainer.style.display === 'none') {
    overlayContainer.style.display = 'block';
  } else {
    overlayContainer.style.display = 'none';
  }
}

// Listen for messages from background script
// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: Message, _sender: chrome.runtime.MessageSender, sendResponse: SendResponse) => {
  if (message.action === 'toggleOverlay') {
    toggleOverlay();
    sendResponse({ status: 'overlayToggled' });
  }
  return true;
});

// Initial check if overlay should be shown (e.g., from storage)
// Initial check if overlay should be shown (e.g., from storage)
chrome.runtime.sendMessage({ action: 'checkOverlayState' }, (response: any) => {
  if (response?.showOverlay) {
    toggleOverlay();
  }
});