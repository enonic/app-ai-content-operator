module.exports = {
    extends: '@enonic/eslint-config',
    plugins: ['import'],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parserOptions: {
                project: './tsconfig.json',
            },
            rules: {
                '@typescript-eslint/no-unsafe-enum-comparison': ['off'],
                'import/no-cycle': ['error'],
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            excludedFiles: '*.d.ts',
            rules: {
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {vars: 'all', args: 'after-used', argsIgnorePattern: '^_'},
                ],
                '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            },
        },
        {
            files: ['src/main/resources/admin/**/*.js'],
            extends: '@enonic/eslint-config/xp',
        },
    ],
    ignorePatterns: ['bin', 'build', 'src/test/resources/**/*.js', 'src/main/resources/assets'],
};
