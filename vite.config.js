import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, admin.localhost:5173 opens the owner dashboard, matching
// how admin.yashpalace.com behaves in production.
const adminHostInDev = () => ({
  name: 'admin-host-in-dev',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const isAdmin = (req.headers.host ?? '').startsWith('admin.');
      const path = (req.url ?? '/').split('?')[0];
      if (isAdmin && !path.startsWith('/api') && !path.includes('.') && !path.startsWith('/@')) {
        req.url = '/admin.html';
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), adminHostInDev()],
  server: {
    port: 5173,
    host: true,
    watch: { ignored: ['**/.wrangler/**'] },
    proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false } },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
});
