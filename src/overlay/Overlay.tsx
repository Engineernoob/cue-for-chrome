import React, { useState, useEffect } from "react";
import {
  summarizeText,
  proofreadText,
  rewriteText,
  translateText,
  isAIAvailable,
} from "@/utils/api";

interface OverlayProps {}

export enum Mode {
  INTERVIEW = "interview",
  CODING_TEST = "coding_test",
  MEETING = "meeting",
}

const MODE_LABELS: Record<Mode, string> = {
  [Mode.INTERVIEW]: "Interview Mode",
  [Mode.CODING_TEST]: "Coding Test Mode",
  [Mode.MEETING]: "Meeting Mode",
};

const Overlay: React.FC<OverlayProps> = () => {
  const [currentMode, setCurrentMode] = useState<Mode>(Mode.INTERVIEW);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<
    "summarize" | "proofread" | "rewrite" | "translate" | null
  >(null);

  // --- AI Status Badge ---
  const [aiReady, setAiReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial check
    setAiReady(isAIAvailable());

    // Poll every 5s until AI becomes available
    const interval = setInterval(() => {
      if (!aiReady) {
        const available = isAIAvailable();
        setAiReady(available);
        if (available) {
          clearInterval(interval); // stop once AI is ready
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [aiReady]);

  const handleModeChange = (mode: Mode) => {
    setCurrentMode(mode);
    setOutputText("");
  };

  const handleAIAction = async (
    selectedAction: "summarize" | "proofread" | "rewrite" | "translate"
  ) => {
    if (!inputText.trim()) {
      alert("Please enter some text to process.");
      return;
    }

    setIsLoading(true);
    setAction(selectedAction);

    try {
      let resultText = "";

      switch (selectedAction) {
        case "summarize": {
          const res = await summarizeText(inputText, currentMode);
          resultText = res.error ? `⚠️ ${res.error}` : res.text;
          break;
        }
        case "proofread": {
          const res = await proofreadText(inputText);
          resultText = res.error ? `⚠️ ${res.error}` : res.text;
          break;
        }
        case "rewrite": {
          const res = await rewriteText(inputText, "concise");
          resultText = res.error ? `⚠️ ${res.error}` : res.text;
          break;
        }
        case "translate": {
          const res = await translateText(inputText, "es");
          resultText = res.error ? `⚠️ ${res.error}` : res.text;
          break;
        }
      }

      setOutputText(resultText);
    } catch (error) {
      console.error("AI processing error:", error);
      setOutputText("Error processing text. Ensure Chrome AI is enabled.");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const closeOverlay = () => {
    if (chrome.runtime) {
      chrome.runtime.sendMessage({ action: "hideOverlay" });
    }
  };

  return (
    <div className="w-full h-full bg-white text-gray-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h1 className="text-lg font-semibold">Cue for Chrome</h1>
        <div className="flex items-center gap-2">
          {/* AI Status Badge */}
          <span
            className={`px-2 py-1 text-xs rounded ${
              aiReady
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {aiReady === null
              ? "Checking…"
              : aiReady
              ? "AI Ready ✅"
              : "AI Unavailable ⚠️"}
          </span>
          <button
            onClick={closeOverlay}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Mode:</label>
        <div className="flex space-x-2">
          {Object.values(Mode).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-3 py-1 rounded text-sm ${
                currentMode === mode
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Current: {MODE_LABELS[currentMode]} - Tailored AI suggestions for{" "}
          {MODE_LABELS[currentMode].toLowerCase()}
        </p>
      </div>

      {/* Input Text Area */}
      <div className="mb-4 flex-1">
        <label className="block text-sm font-medium mb-2">Input Text:</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Enter text for ${MODE_LABELS[
            currentMode
          ].toLowerCase()}... (e.g., interview answers, code prompts, meeting notes)`}
          className="w-full h-32 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* AI Action Buttons */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium mb-2">AI Actions:</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAIAction("summarize")}
            disabled={isLoading}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading && action === "summarize"
              ? "Processing..."
              : "Summarize"}
          </button>
          <button
            onClick={() => handleAIAction("proofread")}
            disabled={isLoading}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading && action === "proofread"
              ? "Processing..."
              : "Proofread"}
          </button>
          <button
            onClick={() => handleAIAction("rewrite")}
            disabled={isLoading}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading && action === "rewrite" ? "Processing..." : "Rewrite"}
          </button>
          <button
            onClick={() => handleAIAction("translate")}
            disabled={isLoading}
            className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {isLoading && action === "translate"
              ? "Processing..."
              : "Translate"}
          </button>
        </div>
      </div>

      {/* Output Display */}
      {outputText && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Output:</label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded max-h-40 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{outputText}</p>
          </div>
          <button
            onClick={() => setOutputText("")}
            className="mt-2 text-xs text-blue-500 hover:underline"
          >
            Clear Output
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center border-t pt-2">
        Client-side AI processing - Privacy preserved. Press Ctrl+Shift+Q to
        toggle.
      </div>
    </div>
  );
};

export default Overlay;
