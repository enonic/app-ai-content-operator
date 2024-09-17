/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    coverageProvider: 'v8',
    collectCoverageFrom: ['src/main/resources/**/*.{ts,tsx}', '!src/**/*.d.ts'],
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
    projects: [
        {
            displayName: 'node',
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/src/**/*(*.)@(spec|test).ts?(x)'],
            testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/src/main/resources/assets/'],
            setupFilesAfterEnv: ['./tests/jest.node.setup.js'],
            moduleNameMapper: {
                '^/lib/http-client$': '<rootDir>/src/main/resources/types/lib/httpClient.d.ts',
                '^/tests/testUtils/(.+)$': '<rootDir>/tests/testUtils/$1',
            },
        },
        {
            displayName: 'browser',
            preset: 'ts-jest/presets/js-with-ts-esm',
            testEnvironment: 'jsdom',
            transform: {
                '^.+\\.tsx?$': [
                    'ts-jest',
                    {
                        tsconfig: '<rootDir>/src/main/resources/assets/tsconfig.json',
                    },
                ],
            },
            transformIgnorePatterns: ['node_modules/.pnpm/(?!(nanostores))'],
            testMatch: ['<rootDir>/src/main/resources/assets/**/*(*.)@(spec|test).ts?(x)'],
            setupFilesAfterEnv: ['./tests/jest.browser.setup.ts'],
        },
    ],
};
