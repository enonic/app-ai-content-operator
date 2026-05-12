import { readdirSync } from 'node:fs';
import { build } from 'esbuild';

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
  target: 'es2023',
  platform: 'neutral',
  mainFields: ['module', 'main'],
  external: ['/lib/xp/*', '/lib/http-client', '/lib/cron', '/lib/license'],
  sourcemap: !isProduction,
  minify: false,
  ...(isProduction && {
    legalComments: 'none',
    drop: ['debugger'],
  }),
});
