import React from "react";
import { createRoot } from "react-dom/client";
import Overlay from "./overlay/Overlay";
import "./overlay/overlay.css";
import { initializeStorage, getStorageData } from "./utils/storage";
import { isAIAvailable } from "./utils/api";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean }
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Overlay error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">
            The overlay encountered an error. Try reloading the page.
          </p>
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

// Main App Component
const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [aiStatus, setAiStatus] = React.useState<
    "available" | "unavailable" | "checking"
  >("checking");

  React.useEffect(() => {
    const initApp = async () => {
      try {
        await initializeStorage();

        const aiAvailable = isAIAvailable();
        setAiStatus(aiAvailable ? "available" : "unavailable");

        const data = await getStorageData();
        console.log("App initialized with preferences:", data.preferences);

        setIsInitialized(true);
      } catch (error) {
        console.error("App initialization error:", error);
        setIsInitialized(true);
        setAiStatus("unavailable");
      }
    };

    initApp();
  }, []);

  // Global listeners
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const overlay = document.getElementById("cue-overlay-container");
        if (overlay && overlay.style.display !== "none") {
          overlay.style.display = "none";
        }
      }
    };

    const handleMessage = (message: any) => {
      if (message.action === "hideOverlay") {
        const overlay = document.getElementById("cue-overlay-container");
        if (overlay) {
          overlay.style.display = "none";
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            Initializing Cue for Chrome...
          </p>
          {aiStatus === "checking" ? (
            <p className="text-xs text-gray-500 mt-1">
              Checking AI availability
            </p>
          ) : aiStatus === "unavailable" ? (
            <p className="text-xs text-red-500 mt-1">
              AI unavailable — using simulation mode
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Overlay />
      {aiStatus === "unavailable" && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-xs max-w-xs">
          AI APIs unavailable. Enable in{" "}
          <code>chrome://flags/#experimental-ai</code>. Using simulation mode.
        </div>
      )}
    </ErrorBoundary>
  );
};

// 🔽 Mount App into #cue-overlay-container
const container = document.createElement("div");
container.id = "cue-overlay-container";
document.body.appendChild(container);

const root = createRoot(container);
root.render(<App />);
