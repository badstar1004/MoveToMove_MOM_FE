module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended'],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  rules: {
    'vue/no-multiple-template-root': 'off', // 다중 루트 요소 허용
    'vue/no-unused-vars': 'warn', // 사용하지 않는 변수에 대해 경고
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // production 환경에서는 console.log에 경고
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // production 환경에서는 debugger에 경고
  },
};
