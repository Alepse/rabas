import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    compression(), // Enable gzip/brotli compression
    visualizer({ open: true }), // Analyze bundle size
  ],
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
        manualChunks: (id) => {
          // Split dependencies to optimize bundle size
          if (id.includes('node_modules')) {
            return 'vendor'; // Separate vendor libraries
          }
          if (id.includes('components')) {
            return 'components'; // Separate components
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500, // Increase the chunk size warning limit if needed
  },
});
