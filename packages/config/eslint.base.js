// @ts-check
const tseslint = require("typescript-eslint");

/** Base ESLint flat config shared by all workspace packages. */
module.exports = tseslint.config(
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/coverage/**", "**/generated/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  }
);
