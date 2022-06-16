module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'alloy',
    'alloy/vue',
    'prettier',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
