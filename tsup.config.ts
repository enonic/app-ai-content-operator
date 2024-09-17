import {globSync} from 'glob';
import type {Options} from 'tsup';

export const DIR_DST = 'build/resources/main';
export const DIR_DST_ASSETS = `${DIR_DST}/assets`;

export const DIR_SRC = 'src/main/resources';
export const DIR_SRC_ASSETS = `${DIR_SRC}/assets`;

const fixSlash = (s: string): string => s.replace(/\\/g, '/');

export default function buildServerConfig(): Options {
    const EXT = '{ts,js}';
    const FILES_SERVER = globSync(`${DIR_SRC}/**/*.${EXT}`, {
        absolute: false,
        ignore: globSync([
            `${DIR_SRC}/**/*.test.${EXT}`,
            `${DIR_SRC}/types/**/*.${EXT}`,
            `${DIR_SRC_ASSETS}/**/*.${EXT}`,
        ]).map(fixSlash),
    }).map(fixSlash);

    return {
        bundle: false,
        dts: false,
        entry: FILES_SERVER,
        esbuildOptions(options) {
            options.outdir = DIR_DST;
            options.chunkNames = '_chunks/[name]-[hash]';
            options.mainFields = ['module', 'main'];
        },
        external: ['/lib/http-client', /^\/lib\/xp\//],
        format: 'cjs',
        inject: [],
        minify: false,
        platform: 'neutral',
        silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE || ''),
        shims: false,
        splitting: true,
        sourcemap: false,
        target: 'es5',
        outExtension: () => ({js: '.js'}),
    };
}
