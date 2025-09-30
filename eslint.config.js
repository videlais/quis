import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import jestPlugin from "eslint-plugin-jest";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], ...js.configs.recommended },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  { files: ["**/*.test.{js,mjs,cjs,ts,mts,cts}"], plugins: { jest: jestPlugin }, rules: jestPlugin.configs.recommended.rules },
  { files: ["**/*.test.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: {...globals.jest} } },
  ...tseslint.configs.recommended,
  { files: ["test/**/*.js"], rules: { "@typescript-eslint/no-require-imports": "off", "no-undef": "off" } },
]);
