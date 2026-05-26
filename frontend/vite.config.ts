import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(() => {
    return {
      server: {
        proxy: {
          //Target your Node.js backend
          '/api-proxy': 'http://127.0.0.1:5000',
          '/ws-proxy': {target: 'ws://127.0.0.1:5000', ws: true},
        },
      },
      plugins: react(),
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
