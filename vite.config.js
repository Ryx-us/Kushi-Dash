import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    // Add these basic optimizations
    build: {
        chunkSizeWarningLimit: 1000,
    },
    resolve: {
        dedupe: ['react', 'react-dom']
    }
});