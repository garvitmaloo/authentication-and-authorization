module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: "standard-with-typescript",
  overrides: [
    {
      env: {
        node: true
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script"
      }
    }
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "no-console": "warn",
    "@typescript-eslint/quotes": ["error", "double"],
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  }
};
