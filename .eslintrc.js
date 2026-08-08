module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
    ],
    ignorePatterns: ["dist", ".eslintrc.js"],
    parser: "@typescript-eslint/parser",
    plugins: ["react-refresh"],
    overrides: [
        {
            files: ["**/*.js"],
            env: { node: true },
            rules: {
                "@typescript-eslint/no-var-requires": "off",
            },
        },
        {
            files: ["__tests__/**/*.{ts,tsx}", "scripts/__tests__/**/*.ts"],
            rules: {
                "@typescript-eslint/no-var-requires": "off",
                "react-hooks/rules-of-hooks": "off",
                "react-hooks/exhaustive-deps": "off",
            },
        },
    ],
    rules: {
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
    },
};
