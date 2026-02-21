/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
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
                tsconfig: {
                    target: "ES2022",
                    module: "CommonJS",
                    moduleResolution: "Node",
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
