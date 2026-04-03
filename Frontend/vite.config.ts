import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Use default HMR settings to avoid binding to port 443
    middlewareMode: false,
    hmr: {
      protocol: "ws",
      host: process.env.VITE_HMR_HOST || "localhost",
      port: 5173,
    },
    host: "0.0.0.0",
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "*.ngrok-free.dev",
      "*.ngrok.io",
      "stockd.live",
      "*.stockd.live",
      "*.trycloudflare.com",
      "unclawed-dot-interequinoctial.ngrok-free.dev",
      "terrance-neonatal-abeyantly.ngrok-free.dev",
      "parental-thwartly-averi.ngrok-free.dev",
      "cytoarchitecturally-unfiring-criselda.ngrok-free.dev",
      "brashy-winterless-jacque.ngrok-free.dev",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
