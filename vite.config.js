import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const bypassHtml = (req) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return '/index.html';
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/customers': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        bypass: bypassHtml,
      },
      '/products': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        bypass: bypassHtml,
      },
      '/wishlist': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        bypass: bypassHtml,
      },
      '/cart': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        bypass: bypassHtml,
      },
      '/orders': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        bypass: bypassHtml,
      }
    }
  }
});
