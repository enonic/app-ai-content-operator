import enonicConfig from '@enonic/eslint-config';
import enonicXpConfig from '@enonic/eslint-config/xp.js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const CLIENT_FILES = ['src/main/resources/assets/**/*.ts', 'src/main/resources/assets/**/*.tsx'];

export default tseslint.config(
    // === Global ignores ===
    {
        ignores: ['bin/**', 'build/**', 'coverage/**', 'src/test/resources/**/*.js', '*.config.js'],
    },

    // === Base: @enonic/eslint-config (includes vanilla + typescript) ===
    ...enonicConfig,

    // === Server TS overrides ===
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: CLIENT_FILES,
        languageOptions: {
            parserOptions: {project: './tsconfig.json'},
        },
        plugins: {import: importPlugin},
        settings: {
            'import/parsers': {'@typescript-eslint/parser': ['.ts', '.tsx']},
            'import/resolver': {typescript: {alwaysTryTypes: true}},
        },
        rules: {
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            'import/no-cycle': 'error',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.d.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {vars: 'all', args: 'after-used', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_'},
            ],
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        },
    },

    // === Declaration files: disable consistent-type-definitions (declaration merging needs interface) ===
    {
        files: ['**/*.d.ts', 'src/main/resources/assets/types/global.ts'],
        rules: {
            '@typescript-eslint/consistent-type-definitions': 'off',
        },
    },

    // === XP admin JS files ===
    {
        files: ['src/main/resources/admin/**/*.js'],
        ...enonicXpConfig,
    },

    // === Client (assets): React + JSX A11y ===
    {
        files: CLIENT_FILES,
        ...react.configs.flat.recommended,
        ...react.configs.flat['jsx-runtime'],
    },
    {
        files: CLIENT_FILES,
        ...jsxA11y.flatConfigs.recommended,
    },
    {
        files: CLIENT_FILES,
        languageOptions: {
            parserOptions: {
                project: './src/main/resources/assets/tsconfig.json',
            },
            globals: {...globals.browser},
        },
        plugins: {import: importPlugin},
        settings: {
            react: {version: 'detect'},
            'import/parsers': {'@typescript-eslint/parser': ['.ts', '.tsx']},
            'import/resolver': {
                typescript: {alwaysTryTypes: true, project: './src/main/resources/assets/tsconfig.json'},
            },
        },
        rules: {
            '@typescript-eslint/no-empty-function': 'error',
            '@typescript-eslint/no-use-before-define': ['error', {functions: false, classes: true}],
            '@typescript-eslint/member-ordering': 'error',
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {allowExpressions: true, allowConciseArrowFunctionExpressionsStartingWithVoid: true},
            ],
            '@typescript-eslint/unbound-method': ['error', {ignoreStatic: true}],
            'import/no-unresolved': 'error',
        },
    },

    // === Client test files ===
    {
        files: ['src/main/resources/assets/**/*.test.ts', 'src/main/resources/assets/**/*.test.tsx'],
        languageOptions: {
            globals: {...globals.jest, ...globals.node},
        },
    },
);
