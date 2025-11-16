/* eslint-disable import/no-commonjs */
const path = require("path");

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // IMPORTANT pour que le parser trouve les tsconfig quand ESLint est lancé depuis la racine monorepo
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "./tsconfig.dev.json"],
    sourceType: "module",
  },
  settings: {
    // Permet à eslint-plugin-import de résoudre les .ts/.tsx selon le tsconfig
    "import/resolver": {
      typescript: {
        project: path.join(__dirname, "tsconfig.json"),
      },
    },
  },
  ignorePatterns: [
    "lib/**",          // build output (Firebase)
    "generated/**",    // fichiers générés
    "node_modules/**",
    "**/*.d.ts"
  ],
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    quotes: ["error", "double"],
    indent: ["error", 2, { SwitchCase: 1 }],
    "object-curly-spacing": ["error", "always"],
    "require-jsdoc": "off",
    "import/no-unresolved": "off",
    "import/no-named-as-default": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off"
  },
  overrides: [
    {
      files: ["**/*.js"],
      parser: null,
      parserOptions: { sourceType: "script" }, // CommonJS
      rules: {
        strict: ["error", "global"],
        "max-len": "off",
        "no-useless-escape": "off"
      }
    }
  ]
};
