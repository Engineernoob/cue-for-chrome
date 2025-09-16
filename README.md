# 🧠 Cue for Chrome – Your Invisible Thinking Partner

Cue is a **neurodivergent-friendly Chrome Extension** that provides **real-time AI scaffolding** through an invisible overlay.  
It helps you stay calm, focused, and productive during **interviews, coding tests, and meetings** — without distracting or cluttering your screen.

---

## ✨ Features

- 🔄 Toggle overlay with **Ctrl+Shift+Q** (Win/Linux) or **Cmd+Shift+Q** (Mac)
- 🧩 Three modes:
  - **Interview Mode** – keep your answers clear and concise
  - **Coding Test Mode** – get suggestions without breaking flow
  - **Meeting Mode** – take clean notes and summaries
- 🤖 AI Actions:
  - **Summarize** – condense long text into key points
  - **Proofread** – fix grammar and clarity issues
  - **Rewrite** – rephrase to be more concise or polished
  - **Translate** – translate text to another language
- ✅ On-device Gemini Nano AI (via Chrome Canary)
- 🔒 **Privacy-first** – all processing happens locally in the browser

---

## 🚀 Quick Start (For Judges)

### 1. Prerequisites

- Install [Chrome Canary](https://www.google.com/chrome/canary/).
- Enable these flags:
  - `chrome://flags/#optimization-guide-on-device-model` → **Enabled**
  - `chrome://flags/#prompt-api-web` → **Enabled**
  - `chrome://flags/#experimental-ai` → **Enabled**

### 2. Clone & Build

```bash
git clone https://github.com/YOUR-USERNAME/cue-for-chrome.git
cd cue-for-chrome
npm install
npm run build

3. Load Extension

Go to chrome://extensions

Enable Developer Mode

Click Load unpacked → Select the dist/ folder

4. Test the Extension

Open any webpage

Press Ctrl+Shift+Q / Cmd+Shift+Q to toggle Cue overlay

Paste text (interview answers, notes, etc.)

Try Summarize / Proofread / Rewrite / Translate

Watch the AI Status Badge turn to “AI Ready ✅” once Chrome AI model loads

🛠️ Built With

TypeScript

React + Vite

Tailwind CSS

Chrome Extension Manifest V3

Chrome’s Experimental AI APIs (Summarizer, Proofreader, Rewriter, Translator, Prompt)

📄 License

MIT License
 © 2025 Taahirah Denmark

ℹ️ Privacy Note

Cue runs entirely in your browser. All AI actions are processed locally on-device with Gemini Nano in Chrome Canary. No data is sent to external servers.

🙌 Acknowledgments

Built for the Google Chrome AI Challenge 2025.

Special thanks to the Chrome team for making on-device AI accessible for developers.
```
