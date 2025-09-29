import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { cartographer } from "@replit/vite-plugin-cartographer";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined 
      ? [cartographer()] 
      : []),
    runtimeErrorModal(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./client/src"),
      "@shared": path.resolve(import.meta.dirname, "./shared"),
      "@assets": path.resolve(import.meta.dirname, "./attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "./client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "./dist/public"),
    emptyOutDir: true,
  },
});