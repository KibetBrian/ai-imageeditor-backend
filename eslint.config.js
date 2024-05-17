/* eslint-disable no-magic-numbers */
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "rules": {
      "no-multiple-empty-lines": [
        "error",
        {
          "max": 1,
          "maxEOF": 1
        }
      ],
      "no-unused-vars": "error",
      "semi": ["error", "always"],
      "no-console": "error",
      "indent": ["error", 2],
      "camelcase": "error",
      "no-magic-numbers": ["error", { "ignore": [0, 1] }],
      "prefer-const": "error",
      "no-unused-expressions": "error",
      "no-use-before-define": "error",
      "no-restricted-syntax": ["error", "WithStatement"],
      "max-lines-per-function": ["error", { "max": 80 }],
      "max-params": ["error", 3],
      "max-depth": ["error", 3],
      "max-nested-callbacks": ["error", 3],
      "max-statements": ["error", 100],
      "max-statements-per-line": ["error", { "max": 1 }],
      "no-warning-comments": "warn",
      "prefer-arrow-callback": "error",
      "prefer-rest-params": "error",
      "prefer-template": "error",
      "no-shadow": "error",
      "linebreak-style": ["error", "unix"],
      "comma-dangle": ["error", "never"],
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "no-var": "error",
      "no-useless-call": "error",
      "eqeqeq": ["error", "always"]
    }
  }  
];