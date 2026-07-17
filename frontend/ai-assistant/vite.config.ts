import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: fileURLToPath(new URL('../../public/ai-assistant', import.meta.url)),
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2022',
    lib: {
      entry: fileURLToPath(new URL('./src/index.tsx', import.meta.url)),
      formats: ['es'],
      fileName: () => 'ai-assistant.js'
    },
    rollupOptions: {
      output: {
        entryFileNames: 'ai-assistant.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: assetInfo =>
          assetInfo.name?.endsWith('.css') || assetInfo.names?.some(name => name.endsWith('.css'))
            ? 'ai-assistant.css'
            : 'assets/[name]-[hash][extname]'
      }
    }
  }
});
