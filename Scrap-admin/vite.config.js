import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Production: admin is served from same host as API (ecoscrap-1.onrender.com)
// so VITE_API_URL defaults to /api (same origin)
export default defineConfig({
  plugins: [react()],
  base: "/",
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

