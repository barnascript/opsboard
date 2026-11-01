/** @type {import('jest').Config} */
const swc = ["@swc/jest", { jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } } }];

module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/packages", "<rootDir>/apps"],
  testMatch: ["**/*.test.ts?(x)"],
  transform: { "^.+\\.(t|j)sx?$": swc },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/test/styleStub.js",
    "^@/(.*)$": "<rootDir>/apps/shell/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/dist/"],
  collectCoverageFrom: ["packages/*/src/**/*.{ts,tsx}", "apps/*/src/**/*.{ts,tsx}", "!**/bootstrap.tsx", "!**/index.ts"],
};
