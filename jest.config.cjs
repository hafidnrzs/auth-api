module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.cjs" }],
  },
  moduleFileExtensions: ["js", "json", "node"],
  clearMocks: true,
};
