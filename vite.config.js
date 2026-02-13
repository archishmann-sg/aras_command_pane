import {defineConfig} from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.js",
            name: "Aras_Command_Pane",
            formats: ["iife"            ],
            fileName: () => "aras_pane.js"
        },
        outDir: "dist",
        emptyOutDir: true,
    }
});