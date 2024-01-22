/*!
 * config file for `eslint`
 *
 * update: wget -O .eslintrc.cjs https://git.io/fjVjK
 * document: https://eslint.org/docs/user-guide/configuring
 */

/* @fisker/eslint-config https://git.io/fjOeH */

module.exports = {
  root: true,
  env: {},
  parserOptions: {},
  extends: ['@fisker'],
  settings: {},
  rules: {
    'max-classes-per-file': 'off',
    'import/no-named-as-default': 'off',
  },
  plugins: [],
  globals: {},
  overrides: [],
}
