import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite собирает проект. Плагин react учит его понимать JSX.
export default defineConfig({
  plugins: [react()],
});
