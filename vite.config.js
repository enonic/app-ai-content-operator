import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
    plugins: [react(), EnvironmentPlugin(['NODE_ENV'])],
    build: {
        lib: {
            entry: 'src/main/resources/assets/index.tsx',
            name: 'Enonic.AI.contentOperator',
            cssFileName: 'style',
            formats: ['iife'],
        },
        rollupOptions: {
            input: 'src/main/resources/assets/index.tsx',
            output: {
                entryFileNames: '[name].js',
                extend: true,
            },
        },
        emptyOutDir: false,
        outDir: 'build/resources/main/assets',
        sourcemap: isDev ? 'inline' : false,
        minify: !isDev,
    },
});
