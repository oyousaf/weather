const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,

  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      args[0]["__VUE_PROD_HYDRATION_MISMATCH_DETAILS__"] = true;
      return args;
    });
  },

  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: "all",
        maxSize: 250000, 
      },
    },
  },
});
