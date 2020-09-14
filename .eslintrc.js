/* eslint-disable */

const { platform } = require('os');

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jasmine: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
  },
  plugins: [
    'react',
  ],
  rules: {
    'linebreak-style': ['error', platform() === 'win32' ? 'windows' : 'linux'],
    'react/no-array-index-key': 0,
  },
};
