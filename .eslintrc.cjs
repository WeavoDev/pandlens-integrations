module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'n8n/',
    'wordpress/',
    'widget/dist/',
    'zapier/node_modules/',
  ],
  overrides: [
    {
      files: ['widget/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
      env: {
        browser: true,
        node: true,
      },
    },
  ],
};
