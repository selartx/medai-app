const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      '.vercel/**',
      'public/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
    ],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-useless-catch': 'off',
      '@next/next/no-img-element': 'warn', // Convert to warning instead of error
    },
  },
];