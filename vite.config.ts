import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'myapp-privateKey.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'myapp.crt')),
    },
  },
})
