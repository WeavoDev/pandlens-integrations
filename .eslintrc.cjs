module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist/', 'node_modules/', 'n8n/dist/'],
};
