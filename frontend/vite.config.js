import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: 'src',
    base: './',
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
    define: {
      'import.meta.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL || env.VITE_BACKEND_URL || 'http://localhost:3000'),
      'import.meta.env.TELEGRAM_BOT_NAME': JSON.stringify(env.TELEGRAM_BOT_NAME || env.VITE_TELEGRAM_BOT_NAME || 'your_bot_username'),
      'import.meta.env.APP_NAME': JSON.stringify(env.APP_NAME || env.VITE_APP_NAME || 'CyberTap'),
      'import.meta.env.DEMO_TELEGRAM_ID': JSON.stringify(env.DEMO_TELEGRAM_ID || env.VITE_DEMO_TELEGRAM_ID || '123456789'),
    },
  };
});
