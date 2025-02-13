/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/tests/jest-setup.ts"],
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/", "/build/"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: {
        // Override tsconfig for tests
        moduleResolution: "node",
        esModuleInterop: true,
        allowJs: true,
        checkJs: true,
        strict: true,
        types: ["node", "jest", "@jest/globals"],
        typeRoots: ["./node_modules/@types", "./src/types", "./tests/types"],
      },
    },
  },
};
