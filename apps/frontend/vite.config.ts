/// <reference types='vitest' />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => ({
  base: '/',
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  server: {
    port: 4200,
    host: 'localhost',
    historyApiFallback: true,

    // localhost proxy
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  optimizeDeps: {
    // include: ['pdfjs-dist/build/pdf.worker.min.js'],
  },

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  resolve: {
    alias: {
      '@prodgenie/libs/ui': path.resolve(__dirname, '../../libs/ui/src'),
      '@prodgenie/libs/utils': path.resolve(__dirname, '../../libs/utils/src'),
      '@prodgenie/libs/constant': path.resolve(
        __dirname,
        '../../libs/constant/src'
      ),
      '@prodgenie/libs/schema': path.resolve(
        __dirname,
        '../../libs/schema/src'
      ),
      '@prodgenie/libs/store': path.resolve(__dirname, '../../libs/store/src'),
      '@prodgenie/libs/frontend-services': path.resolve(
        __dirname,
        '../../libs/frontend-services/src'
      ),
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 2000,
  },
}));
