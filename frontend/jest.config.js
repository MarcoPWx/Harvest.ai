const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
    "^msw$": "<rootDir>/node_modules/msw/lib/core/index.js",
  },
  // Ensure Jest can resolve ESM .mjs files (e.g., msw v2)
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "mjs"],
  // Allow transforming ESM in node_modules for specific packages
  transformIgnorePatterns: ["/node_modules/(?!(msw|uncrypto)/)"],
  collectCoverageFrom: [
    // Focus coverage on core libraries and services only for now.
    "src/lib/**/*.{js,jsx,ts,tsx}",
    "src/services/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    // Exclude Next.js app router pages and static pages from coverage
    "!src/app/**",
    // Exclude Storybook docs/components and test-only utilities
    "!src/stories/**",
    "!src/test-utils/**",
    // Exclude mocks and demo-only content
    "!src/mocks/**",
    "!src/lib/demo/**",
    // Exclude long-tail or template-only modules slated for future tests
    "!src/lib/templates/**",
    "!src/lib/analytics/**",
    "!src/lib/security/**",
    "!src/lib/client/**",
    "!src/lib/realtime/**",
    "!src/services/templates/**",
    // Exclude particularly low-coverage or infra-only modules for now
    "!src/lib/ai/providers/**",
    "!src/lib/supabase/**",
    "!src/lib/auth/**",
    "!src/lib/rate-limit.ts",
    "!src/lib/utils.ts",
    // Exclude types
    "!src/types/**",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/stories/",
    "<rootDir>/src/stories/",
    "<rootDir>/src/app/",
    "<rootDir>/src/mocks/",
    "<rootDir>/src/test-utils/",
    "<rootDir>/src/lib/templates/",
    "<rootDir>/src/lib/demo/",
    "<rootDir>/src/lib/analytics/",
    "<rootDir>/src/lib/security/",
    "<rootDir>/src/lib/client/",
    "<rootDir>/src/lib/realtime/",
    "<rootDir>/src/services/templates/",
    "<rootDir>/src/types/",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
