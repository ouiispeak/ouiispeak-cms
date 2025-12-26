import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Changed from "node" to "jsdom" for React component/hook testing
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
    setupFiles: ["./vitest.setup.ts"],
  },
});

