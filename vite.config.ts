import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const isProduction = process.env.NODE_ENV === 'production';

const assetsPath = fileURLToPath(new URL('./src/main/resources/assets', import.meta.url));
const sharedPath = fileURLToPath(new URL('./src/main/resources/shared', import.meta.url));

export default defineConfig({
  fmt: {
    singleQuote: true,
    jsxSingleQuote: false,
    sortImports: {
      newlinesBetween: true,
      customGroups: [{ groupName: 'css', elementNamePattern: ['*.css', '*.scss', '*.sass'] }],
      groups: [
        ['value-builtin', 'value-external'],
        'value-internal',
        'type-import',
        ['value-parent', 'value-sibling', 'value-index'],
        'css',
        'unknown',
      ],
    },
    sortPackageJson: false,
    sortTailwindcss: {
      functions: ['cn', 'clsx', 'twMerge'],
    },
  },
  plugins: [preact(), tailwindcss()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
  },
  resolve: {
    alias: {
      '@': assetsPath,
      '@shared': sharedPath,
    },
  },
  build: {
    lib: {
      entry: 'src/main/resources/assets/index.tsx',
      name: 'Enonic.AI.contentOperator',
      cssFileName: 'style',
      formats: ['iife'],
    },
    rollupOptions: {
      onLog(level, log, defaultHandler) {
        // ! @enonic/ui ships a prebuilt bundle whose `/* @__PURE__ */` hints sit where
        //   Rolldown can't attach them. The annotations are harmless, so mute the noise.
        //   Rolldown routes these through `onLog` (not `onwarn`) and omits `id`, so drop
        //   the whole code.
        if (log.code === 'INVALID_ANNOTATION') return;
        defaultHandler(level, log);
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
    outDir: 'build/resources/main/assets',
    emptyOutDir: false,
    sourcemap: isProduction ? false : 'inline',
    minify: isProduction,
  },
  lint: {
    plugins: ['oxc', 'typescript', 'react', 'jsx-a11y', 'unicorn'],
    env: {
      builtin: true,
      es2024: true,
    },
    ignorePatterns: [
      'node_modules/',
      'build/',
      'dist/',
      '.gradle/',
      'src/main/resources/admin/',
      'src/main/resources/static/',
      'src/test/resources/',
      '**/*.d.ts',
    ],
    rules: {
      'no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-redeclare': 'error',
      'no-useless-rename': 'error',
      'no-lone-blocks': 'error',
      'no-unneeded-ternary': 'error',
      'no-array-constructor': 'error',
      'dot-notation': 'error',
      eqeqeq: ['error', 'smart'],
      'operator-assignment': ['error', 'always'],
      'valid-typeof': 'error',

      'typescript/no-explicit-any': 'error',
      'typescript/no-namespace': 'error',
      'typescript/no-require-imports': 'error',
      'typescript/no-extra-non-null-assertion': 'error',
      'typescript/no-misused-new': 'error',
      'typescript/no-unsafe-declaration-merging': 'error',
      'typescript/prefer-as-const': 'error',
      'typescript/prefer-literal-enum-member': 'error',
      'typescript/prefer-namespace-keyword': 'error',
      'typescript/prefer-optional-chain': 'error',
      'typescript/array-type': ['error', { default: 'array' }],
      'typescript/consistent-type-imports': 'error',
      'typescript/consistent-type-exports': 'error',
      'typescript/consistent-type-definitions': ['error', 'type'],
      'typescript/default-param-last': 'error',
      'typescript/no-unnecessary-type-constraint': 'error',

      'react/exhaustive-deps': 'error',
      'react/rules-of-hooks': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',

      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/no-new-array': 'off',
    },
  },
  staged: {
    '*.{js,jsx,ts,tsx,mjs,cjs}': 'vp lint --fix',
  },
  test: {
    environment: 'node',
    include: ['src/main/resources/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/vitest.setup.ts'],
    passWithNoTests: true,
    alias: {
      '@': assetsPath,
      '@shared': sharedPath,
      '/lib/http-client': new URL('./tests/stubs/http-client.js', import.meta.url).pathname,
      '/lib/xp/task': new URL('./tests/stubs/xp-task.js', import.meta.url).pathname,
      '/lib/xp/websocket': new URL('./tests/stubs/xp-websocket.js', import.meta.url).pathname,
      '/lib/xp/event': new URL('./tests/stubs/xp-event.js', import.meta.url).pathname,
      '/lib/xp/content': new URL('./tests/stubs/xp-content.js', import.meta.url).pathname,
      '/lib/xp/context': new URL('./tests/stubs/xp-context.js', import.meta.url).pathname,
      '/lib/xp/project': new URL('./tests/stubs/xp-project.js', import.meta.url).pathname,
      '/lib/cron': new URL('./tests/stubs/cron.js', import.meta.url).pathname,
      '/lib/license': new URL('./tests/stubs/license.js', import.meta.url).pathname,
    },
  },
});
