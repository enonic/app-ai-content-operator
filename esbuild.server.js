import { transformSync } from '@swc/core';
import { build } from 'esbuild';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';

const SRC = 'src/main/resources';
const OUT = 'build/resources/main';

const entryPoints = readdirSync(SRC, { recursive: true, withFileTypes: true })
  .filter(
    (d) =>
      d.isFile() &&
      d.name.endsWith('.ts') &&
      !d.name.endsWith('.d.ts') &&
      !d.name.endsWith('.test.ts'),
  )
  .map((d) => `${d.parentPath}/${d.name}`)
  .filter((f) => !(f.includes('/assets/') || f.includes('/types/')));

await build({
  entryPoints,
  outdir: OUT,
  outbase: SRC,
  bundle: true,
  format: 'cjs',
  target: 'es2020',
  platform: 'neutral',
  mainFields: ['module', 'main'],
  external: ['/lib/xp/*', '/lib/http-client', '/lib/cron', '/lib/license'],
  sourcemap: !isProduction ? 'inline' : false,
  minify: false,
  ...(isProduction && {
    legalComments: 'none',
    drop: ['debugger'],
  }),
});

// SWC lowers the bundle to ES5 so Nashorn (no destructuring, etc.) can run it.
function collectJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue;
      out.push(...collectJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

for (const file of collectJsFiles(OUT)) {
  const code = readFileSync(file, 'utf8');
  const result = transformSync(code, {
    filename: file,
    inputSourceMap: !isProduction,
    sourceMaps: !isProduction ? 'inline' : false,
    jsc: {
      parser: { syntax: 'ecmascript' },
      target: 'es5',
    },
    minify: false,
  });
  writeFileSync(file, result.code);
}
