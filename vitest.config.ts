import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["lib/__tests__/**/*.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**/*.ts"],
      thresholds: {
        lines: 0.95,
        functions: 0.95,
        statements: 0.95,
        branches: 0.9,
      },
    },
    exclude: ["tests/e2e/**"],
  },
});
