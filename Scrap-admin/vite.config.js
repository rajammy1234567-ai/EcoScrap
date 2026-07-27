import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Fallback if VITE_API_URL=/api — same production backend as app
      "/api": {
        target: "https://ecoscrap-1.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
