import React from 'react';
import Overlay from './overlay/Overlay';
import './overlay/overlay.css';
import { initializeStorage, getStorageData } from './utils/storage';
import { isAIAvailable } from './utils/api';

// Error Boundary Component
class ErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Overlay error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">The overlay encountered an error. Try reloading the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

  return this.props.children;
  }
}

// Main App Component - Entry point for the overlay
const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [aiStatus, setAiStatus] = React.useState<'available' | 'unavailable' | 'checking'>('checking');

  React.useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize storage
        await initializeStorage();
        
        // Check AI availability
        const aiAvailable = isAIAvailable();
        setAiStatus(aiAvailable ? 'available' : 'unavailable');
        
        // Load initial data (e.g., set default mode from storage)
        const data = await getStorageData();
        console.log('App initialized with preferences:', data.preferences);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsInitialized(true);
        setAiStatus('unavailable');
      }
    };

    initApp();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Initializing Cue for Chrome...</p>
          {aiStatus === 'checking' ? (
            <p className="text-xs text-gray-500 mt-1">Checking AI availability</p>
          ) : aiStatus === 'unavailable' ? (
            <p className="text-xs text-red-500 mt-1">AI unavailable - using simulation mode</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Overlay />
      {aiStatus === 'unavailable' && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-xs max-w-xs">
          AI APIs unavailable. Enable in chrome://flags/#experimental-ai. Using simulation mode.
        </div>
      )}
    </ErrorBoundary>
  );
};

// Global event listeners for overlay interactions
React.useEffect(() => {
  // Listen for escape key to close overlay
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('cue-overlay-container');
      if (overlay && overlay.style.display !== 'none') {
        overlay.style.display = 'none';
      }
    }
  };

  // Listen for messages to hide overlay
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'hideOverlay') {
      const overlay = document.getElementById('cue-overlay-container');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }
  });

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, []);

// Export App for mounting in contentScript.tsx
export default App;

// Note: In contentScript.tsx, this will be mounted via:
// const root = ReactDOM.createRoot(overlayContainer);
// root.render(<App />);