import { sveltekit } from "@sveltejs/kit/vite";
import evlog from "evlog/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    sveltekit(),
    ...evlog({
      service: "simpleboard",
      sourceLocation: "dev",
    }),
  ],
  build: {
    sourcemap: true,
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
