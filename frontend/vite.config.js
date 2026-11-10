import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/auth': {
        target: process.env.VITE_AUTH_API_URL || 'http://localhost:5001',
        changeOrigin: true
      },
      '/api/students': {
        target: process.env.VITE_STUDENT_API_URL || 'http://localhost:5002',
        changeOrigin: true
      }
    }
  }
});
