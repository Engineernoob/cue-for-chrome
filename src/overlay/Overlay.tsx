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
    setAiReady(isAIAvailable());

    const interval = setInterval(() => {
      if (!aiReady) {
        const available = isAIAvailable();
        setAiReady(available);
        if (available) clearInterval(interval);
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
    <div id="cue-overlay-container">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2">
        <h1 className="text-base font-semibold">Cue for Chrome</h1>
        <div className="flex items-center gap-2">
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
      <div>
        <label className="block text-sm font-medium mb-1">Select Mode:</label>
        <div className="flex gap-2 mb-1">
          {Object.values(Mode).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`px-3 py-1 rounded text-xs ${
                currentMode === mode
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Current: {MODE_LABELS[currentMode]}
        </p>
      </div>

      {/* Input */}
      <label className="block text-sm font-medium mt-2">Input Text:</label>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={`Enter text for ${MODE_LABELS[
          currentMode
        ].toLowerCase()}…`}
        disabled={isLoading}
      />

      {/* Buttons */}
      <div className="cue-buttons mt-2">
        <button
          onClick={() => handleAIAction("summarize")}
          disabled={isLoading}
        >
          {isLoading && action === "summarize" ? "…" : "Summarize"}
        </button>
        <button
          onClick={() => handleAIAction("proofread")}
          disabled={isLoading}
        >
          {isLoading && action === "proofread" ? "…" : "Proofread"}
        </button>
        <button onClick={() => handleAIAction("rewrite")} disabled={isLoading}>
          {isLoading && action === "rewrite" ? "…" : "Rewrite"}
        </button>
        <button
          onClick={() => handleAIAction("translate")}
          disabled={isLoading}
        >
          {isLoading && action === "translate" ? "…" : "Translate"}
        </button>
      </div>

      {/* Output */}
      {outputText && (
        <div className="mt-3">
          <label className="block text-sm font-medium">Output:</label>
          <div className="cue-output">{outputText}</div>
          <button
            onClick={() => setOutputText("")}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-[10px] text-gray-500 text-center border-t pt-2 mt-2">
        Client-side AI processing – Privacy preserved. Press Ctrl+Shift+Q to
        toggle.
      </div>
    </div>
  );
};

export default Overlay;
