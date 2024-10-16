const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack'); // Webpack을 가져옵니다.
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false), // 프로덕션 모드에서 devtools 비활성화
        __VUE_OPTIONS_API__: JSON.stringify(true), // Options API 활성화
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false), // Hydration mismatch 세부 정보 비활성화
      }),
    ],
  },
});
