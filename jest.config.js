/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ["**/*.test.ts"],
    setupFilesAfterEnv: ["<rootDir>/src/__mocks__/logging.mock.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: {
                    target: "ES2022",
                    module: "ESNext",
                    moduleResolution: "bundler",
                    baseUrl: ".",
                    paths: {
                        "@/*": ["src/*"],
                    },
                    experimentalDecorators: true,
                    emitDecoratorMetadata: true,
                    strictPropertyInitialization: false,
                },
            },
        ],
    },
};
