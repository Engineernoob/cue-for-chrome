import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/background.ts"),
        contentScript: resolve(__dirname, "src/content/contentScript.js"),
        overlay: resolve(__dirname, "src/overlay/Overlay.tsx"),
        overlayCSS: resolve(__dirname, "src/overlay/overlay.css"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background/background.js";
          if (chunk.name === "contentScript" || chunk.name === "overlay")
            return "[name].js";
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith("overlay.css")) return "overlay.css";
          return "assets/[name].[ext]";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false, // readable code for debugging
    copyPublicDir: true, // Copy public/ (icons) to dist
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
