import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Em contêiner (bind mount no Mac/Windows) o sistema não avisa quando um arquivo muda: o polling resolve.
    watch: process.env.WATCH_POLLING ? { usePolling: true, interval: 300 } : undefined,
    // Em dev, /api vai para a API local. No docker-compose.local.yml, API_URL aponta para o contêiner da API.
    proxy: {
      '/api': process.env.API_URL || 'http://localhost:3333',
    },
  },
});
