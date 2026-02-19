import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			name: "Aras_Command_Pane",
			formats: ["iife"],
			fileName: () => "aras_pane.js",
		},
		outDir: "dist",
		sourcemap: true,
		emptyOutDir: true,
	},
});
