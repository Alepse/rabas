import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    minify: 'terser', // Enable minification with Terser
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
        drop_debugger: true, // Remove debugger statements
      },
      format: {
        comments: false, // Remove comments
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Split React libraries into a separate chunk
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase the chunk size warning limit
  },
});
