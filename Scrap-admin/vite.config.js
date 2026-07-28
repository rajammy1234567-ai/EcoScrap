import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Production: admin UI is served at /admin on the same host as the API
// Assets load from /admin/assets/* ; API still at /api (same origin)
export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "https://ecoscrap-1.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

