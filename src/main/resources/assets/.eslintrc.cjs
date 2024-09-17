module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:jsx-a11y/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
    ],
    plugins: ['@typescript-eslint', 'import'],
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2023,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    rules: {
        '@typescript-eslint/no-empty-function': ['error'],
        '@typescript-eslint/no-use-before-define': ['error', {functions: false, classes: true}],
        '@typescript-eslint/member-ordering': ['error'],
        '@typescript-eslint/explicit-function-return-type': [
            'error',
            {
                allowExpressions: true,
                allowConciseArrowFunctionExpressionsStartingWithVoid: true,
            },
        ],
        '@typescript-eslint/unbound-method': ['error', {ignoreStatic: true}],
        'import/no-unresolved': 'error',
    },
    settings: {
        react: {
            version: 'detect',
        },
        'i/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: './tsconfig.json',
            },
        },
    },
    env: {
        browser: true,
        es6: true,
    },
    overrides: [
        {
            files: ['*.test.ts', '*.test.tsx'],
            env: {
                jest: true,
                node: true,
            },
        },
    ],
    ignorePatterns: ['.eslintrc.cjs'],
};
