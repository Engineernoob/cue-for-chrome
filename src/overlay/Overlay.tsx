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
      <div className="cue-header">
        <h1>Cue for Chrome</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className={`cue-badge ${aiReady ? "ready" : "unavailable"}`}>
            {aiReady === null
              ? "Checking…"
              : aiReady
              ? "AI Ready ✅"
              : "AI Unavailable ⚠️"}
          </span>
          <button onClick={closeOverlay}>×</button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="cue-modes">
        <label>Select Mode:</label>
        <div className="buttons">
          {Object.values(Mode).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={currentMode === mode ? "active" : ""}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <p>Current: {MODE_LABELS[currentMode]}</p>
      </div>

      {/* Input */}
      <label>Input Text:</label>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={`Enter text for ${MODE_LABELS[
          currentMode
        ].toLowerCase()}…`}
        disabled={isLoading}
      />

      {/* Buttons */}
      <div className="cue-buttons">
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
        <div>
          <label>Output:</label>
          <div className="cue-output">{outputText}</div>
          <button onClick={() => setOutputText("")}>Clear</button>
        </div>
      )}

      {/* Footer */}
      <div className="cue-footer">
        Client-side AI processing – Privacy preserved. Press Ctrl+Shift+Q to
        toggle.
      </div>
    </div>
  );
};

export default Overlay;
