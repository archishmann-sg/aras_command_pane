import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
    prettier,
    {
        files: ["**/*.js"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
            },
        },

        rules: {
            /* ----------------------------
         Core correctness
         ---------------------------- */

            ...js.configs.recommended.rules,

            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],

            "no-undef": "error",
            "no-redeclare": "error",
            "no-console": "off",

            /* ----------------------------
         Async discipline
         ---------------------------- */

            "no-async-promise-executor": "error",
            "require-await": "off",
            "no-return-await": "off",

            /* ----------------------------
         Style (intentional, minimal)
         ---------------------------- */

            semi: ["error", "always"],
            quotes: ["error", "double"],
            "comma-dangle": ["error", "always-multiline"],
            "object-curly-spacing": ["error", "always"],

            /* ----------------------------
         Architecture enforcement
         ---------------------------- */

            /**
             * Commands must NEVER import UI or terminal code.
             * This replaces import/no-restricted-paths safely.
             */
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["../terminal/**", "../../terminal/**"],
                            message: "Commands must not import terminal code",
                        },
                        {
                            group: ["../ui/**", "../../ui/**"],
                            message: "Commands must not import UI code",
                        },
                    ],
                },
            ],
        },
    },

    /* ----------------------------
     Node-only files
     ---------------------------- */

    {
        files: ["**/vite.config.*"],

        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
