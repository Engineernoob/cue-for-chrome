// Background service worker for cue-for-chrome extension
// Handles keyboard shortcuts, message passing, and AI API coordination

// Listen for the toggle-overlay command (Ctrl+Shift+Q)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-overlay') {
    try {
      // Query the currently active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.id) {
        // Send message to content script to toggle overlay
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
      }
    } catch (error) {
      console.error('Error toggling overlay:', error);
    }
  }
});

// Listen for messages from content script (e.g., AI processing requests)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'aiRequest') {
    // Handle AI API calls from content script
    // For now, forward to content script since AI APIs are called client-side
    // In future, could initialize AI models here if needed
    if ((chrome as any).ai) {
      console.log('Chrome AI available');
      sendResponse({ status: 'aiAvailable' });
    } else {
      console.warn('Chrome AI not available');
      sendResponse({ status: 'aiUnavailable' });
    }
  }
  return true; // Keep message channel open for async response
});

// Initialize extension (e.g., check AI availability on startup)
chrome.runtime.onStartup.addListener(() => {
  console.log('Cue for Chrome extension started');
  if ((chrome as any).ai) {
    console.log('Chrome AI APIs available');
  } else {
    console.log('Chrome AI APIs not available - ensure user has enabled experimental features');
  }
});