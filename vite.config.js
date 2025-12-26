import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // host: true,
    // port: 3000,
    proxy: {
      '/api': {
        target: 'https://fqzy.me',
        changeOrigin: true,
        rewrite: (path) => {
          // ลบ /api ออกถ้ามี
          const newPath = path.replace(/^\/api/, '');
          console.log('🔄 Proxying:', path, '->', newPath);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('➡️ Sending request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('⬅️ Received response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
});
