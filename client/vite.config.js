import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This proxies requests from "/api" to "http://localhost:8800"
      '/uploads': {
        target: 'http://localhost:8800/', // The backend server URL
        changeOrigin: true, // Needed for virtual hosted sites
      },
    },
  },
});
