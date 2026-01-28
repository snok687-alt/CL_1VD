import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    minify: 'esbuild', // ใช้ esbuild แทน swc เพื่อลด RAM consumption
    chunkSizeWarningLimit: 4000, // ป้องกัน warning ขนาด chunk
    sourcemap: false, // ลดการใช้ RAM, ถ้าไม่จำเป็น
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // แยก dependencies เป็น vendor bundle
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://api.bwzyz.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api/, '/api.php/provide/vod/at/json'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setTimeout(30000); // 30 วินาที
          });
        }
      }
    }
  },
  optimizeDeps: {
    include: [], // เว้นว่างเพื่อลด RAM ใช้ pre-bundle
  }
});
