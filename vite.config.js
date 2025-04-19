import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 환경 변수 설정
  define: {
    "import.meta.env.BASE_URL": JSON.stringify(""),
  },
  server: {
    proxy: {
      "/api": {
        target: "https://jeogi.vercel.app", // 원격 API 서버로 변경
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("프록시 오류:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("프록시 요청:", req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("프록시 응답:", proxyRes.statusCode);
          });
        },
      },
    },
  },
});
