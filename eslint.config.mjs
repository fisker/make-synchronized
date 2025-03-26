import fiskerEslintConfig from '@fisker/eslint-config'

export default [
  fiskerEslintConfig,
  {ignores: ['index.mjs', 'index.cjs', '.deleted']},
  {
    rules: {
      'sonarjs/public-static-readonly': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/prevent-abbreviations': ['error', {replacements: {util: false}}],
    },
  },
  {
    files: ['tests/typescript-module.test.js'],
    rules: {'sonarjs/no-empty-test-file': 'off'},
  },
].flat()
