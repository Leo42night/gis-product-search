import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: process.env.VITE_NODE_ENV === 'development' ? {
      key: fs.readFileSync(path.resolve(__dirname, 'myapp-privateKey.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'myapp.crt')),
    } : undefined, // Nonaktifkan HTTPS di production
  },
})
