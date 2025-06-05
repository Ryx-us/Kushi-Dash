// filepath: /Users/nadhi/Documents/GitHub/Final-Laravel-react frameowkr /Kushi-Dash/vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.jsx', // Add this line
            refresh: true,
        }),
        react(),
    ],
});