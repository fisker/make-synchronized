import fiskerEslintConfig from '@fisker/eslint-config'

export default [
  fiskerEslintConfig,
  {ignores: ['index.mjs', 'index.cjs', 'worker.mjs']},
  {
    rules: {
      'sonarjs/public-static-readonly': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/prevent-abbreviations': ['error', {replacements: {util: false}}],
    },
  },
].flat()
