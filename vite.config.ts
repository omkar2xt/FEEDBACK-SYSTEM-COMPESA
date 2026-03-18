import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("exceljs")) return "exceljs";
          if (id.includes("recharts") || id.includes("chart.js")) return "charts";
          if (id.includes("three")) return "three";
          if (id.includes("firebase")) return "firebase";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("gsap")) return "gsap";
          return "vendor";
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
