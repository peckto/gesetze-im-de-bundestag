import { defineConfig, loadEnv } from 'vite';
import reactRefresh from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  return {
    plugins: [
      reactRefresh(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: 'src/setupTests.js',
    },
  };
})
