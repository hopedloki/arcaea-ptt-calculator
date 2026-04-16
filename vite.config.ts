import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni()
  ],
  base: './',
  build: {
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: false,
    assetsInlineLimit: 10000,
    rollupOptions: {
      output: {
        // 强制禁用代码分割
        manualChunks: undefined
      }
    }
  },
  // 强制使用 esbuild 而非 terser（terser 可能导致 IIFE 问题）
  optimizeDeps: {
    exclude: ['@cloudbase/adapter-uni-app'],
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/__auth': {
        target: 'https://envId-appid.tcloudbaseapp.com/',
        changeOrigin: true,
      }
    },
    allowedHosts: true
  }
});
