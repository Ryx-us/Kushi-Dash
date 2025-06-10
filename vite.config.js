import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import MillionLint from "@million/lint";
import { splitVendorChunkPlugin } from 'vite'
import million from 'million/compiler';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        million.vite({
            auto: true, // Enable automatic mode for component optimization
            mute: false, // Set to true to reduce logs
        }),
        splitVendorChunkPlugin()
        react(),
        MillionLint.vite()
    ],
});