/* eslint-env node */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'pettier'],
  extends: ['prettier', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  root: true,
};
