module.exports = {
  testEnvironment: "jsdom", // To have access to browser objects like window or document
  preset: "ts-jest",        // preset is optional, you don't need it in case you use babel preset typescript
  modulePaths: ["node_modules", "src"],
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "identity-obj-proxy"
  }
}