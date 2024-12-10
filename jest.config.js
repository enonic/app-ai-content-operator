/** @type {import('jest').Config} */
export default {
    coverageProvider: 'v8',
    collectCoverageFrom: ['src/main/resources/**/*.{ts,tsx}', '!src/**/*.d.ts'],
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
    projects: [
        {
            displayName: 'node',
            testEnvironment: 'node',
            transform: {
                '^.+\\.m?[tj]s?$': '@swc/jest',
            },
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
            testEnvironment: 'jsdom',
            transform: {
                '^.+\\.m?[tj]s?$': '@swc/jest',
            },
            transformIgnorePatterns: ['node_modules/.pnpm/(?!(nanostores))'],
            testMatch: ['<rootDir>/src/main/resources/assets/**/*(*.)@(spec|test).ts?(x)'],
            setupFilesAfterEnv: ['./tests/jest.browser.setup.ts'],
        },
    ],
};
