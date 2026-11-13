import { configDefaults, defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import { config } from "dotenv";

// Load environment variables for integration tests.
config({ path: ".env" });

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is not defined");
}

// Pin the timezone so date tests behave the same on every machine.
process.env.TZ = "America/Chicago";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  test: {
    environment: "node",
    env: {
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
    exclude: [
      ...configDefaults.exclude,
      "tests/e2e/**",
    ],
  },
});