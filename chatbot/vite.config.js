import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
    // Ensure bot.js is built as a standalone script
    minify: "esbuild",
  },
  // Ensure proper MIME type for bot.js
  server: {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
    },
  },
});
