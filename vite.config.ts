import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined // 禁用代码分割
      }
    }
  },
  optimizeDeps: {
    exclude: ['@cloudbase/adapter-uni-app'],
  },
  server: {
    host: '0.0.0.0',  // 使用IP地址代替localhost
    proxy: {
      '/__auth': {
        target: 'https://envId-appid.tcloudbaseapp.com/',
        changeOrigin: true,
      }
    },
    allowedHosts: true
  }
});
