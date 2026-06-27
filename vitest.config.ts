import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // next/navigation + next/link rely on App Router context that doesn't
      // exist under jsdom; point them at lightweight test stubs.
      "next/navigation": path.resolve(
        __dirname,
        "__tests__/stubs/next-navigation.ts"
      ),
      "next/link": path.resolve(__dirname, "__tests__/stubs/next-link.tsx"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", ".next", "dist", ".kilo", "e2e"],
    globals: true,
  },
});
