import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Vitest over Jest: native ESM resolves framer-motion / recharts / socket.io-client
// with zero transform config. See the frontend-test-setup skill.
export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		css: false,
	},
});
