import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // cubejs uses CommonJS patterns — tell Vite to pre-bundle it
  optimizeDeps: {
    include: ['cubejs'],
  },
});
