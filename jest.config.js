export default {
  testEnvironment: "node",
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.js", "!src/**/_test/**", "!src/**/*.test.js"],
  coverageDirectory: "coverage",
  testMatch: ["**/_test/**/*.test.js", "**/__tests__/**/*.test.js"],
  transform: {},
};
