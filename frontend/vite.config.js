import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  // Use environment variables based on the current mode (development or production)
  const isProduction = mode === 'production';

  return {
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {},
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    server: {
      proxy: !isProduction
        ? {
            '/api': {
              target: 'http://localhost:5000/', // Dev backend URL
              changeOrigin: true,
              secure: false, // Set to true if using HTTPS
            },
          }
        : undefined, // No proxy in production
    },
    define: {
      'process.env.API_URL': JSON.stringify(
        isProduction
          ? 'http://147.93.19.247:5000/' // Replace with your production API URL
          : 'http://localhost:5000' // Replace with your development backend URL
      ),
    },
  };
});
