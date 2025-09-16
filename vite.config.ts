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
        content: resolve(__dirname, "src/content/contentScript.tsx"),
        overlay: resolve(__dirname, "src/index.tsx"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background/background.js";
          if (chunk.name === "content") return "content/content.js";
          if (chunk.name === "overlay") return "overlay/overlay.js";
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false, // readable code for debugging
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
