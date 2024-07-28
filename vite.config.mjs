import { defineConfig } from 'vite';
import { telefunc } from 'telefunc/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    telefunc({
      disableNamingConvention: true,
    }),
  ],
  build: { target: 'esnext' },
  server: {
    host: true,
    port: 3000,
  },
});
