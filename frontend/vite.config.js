import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // All /api/* requests are forwarded to the Express backend.
            // The /api prefix is stripped before forwarding.
            "/api": {
                target: "http://localhost:5001",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
