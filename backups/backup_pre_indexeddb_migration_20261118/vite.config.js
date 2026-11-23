import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
        }
      }
    }
  }
});

