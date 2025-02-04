import {defineConfig} from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
    plugins: [EnvironmentPlugin(['NODE_ENV'])],
    build: {
        lib: {
            entry: 'src/main/resources/assets/worker/index.ts',
            formats: ['es'],
            fileName: () => 'websocket.sharedworker.js',
        },
        rollupOptions: {
            input: 'src/main/resources/assets/worker/index.ts',
            output: {
                entryFileNames: '[name].js',
            },
        },
        outDir: 'build/resources/main/assets/worker',
        sourcemap: isDev ? 'inline' : false,
        minify: true,
    },
});
