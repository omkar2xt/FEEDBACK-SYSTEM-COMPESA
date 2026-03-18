import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalizedId = id.replace(/\\/g, "/");
                    const inNodeModules = normalizedId.includes("/node_modules/");
                    if (!inNodeModules)
                        return;

                    const hasPackage = (pkgName) => new RegExp(`(^|/)node_modules/${pkgName}(/|$)`).test(normalizedId);

                    if (hasPackage("exceljs"))
                        return "exceljs";
                    if (hasPackage("recharts") || hasPackage("chart\\.js"))
                        return "charts";
                    if (hasPackage("three"))
                        return "three";
                    if (hasPackage("firebase"))
                        return "firebase";
                    if (hasPackage("framer-motion"))
                        return "motion";
                    if (hasPackage("gsap"))
                        return "gsap";
                    return "vendor";
                }
            }
        }
    },
    server: {
        port: 5173
    }
});
