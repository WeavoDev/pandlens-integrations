module.exports = {
  env: {
    es2022: true,
    node: true,
    mocha: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^should$' }],
  },
};
