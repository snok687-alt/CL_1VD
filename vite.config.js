import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: true,
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://api.bwzyz.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api.php/provide/vod/at/json'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setTimeout(30000); // 30 seconds timeout
          });
        }
      }
    }
  },
  optimizeDeps: {
    include: ['axios']
  }
});
