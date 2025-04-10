/*!
 * config file for `markdownlint-cli2`
 *
 * update: wget -O .eslintrc.js https://git.io/fjVjK
 * document: https://github.com/DavidAnson/markdownlint-cli2
 */

/* @fisker/markdownlint-cli2-config https://github.com/fisker/shared-configs/tree/main/packages/markdownlint-cli2-config */

const fiskerMarkdownlintCli2Config = require('@fisker/markdownlint-cli2-config')

module.exports = {
  ...fiskerMarkdownlintCli2Config,
  config: {
    ...fiskerMarkdownlintCli2Config.config,
    'no-blanks-blockquote': false,
  },
}
