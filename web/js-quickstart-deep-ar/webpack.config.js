const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
require("dotenv").config();

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/",
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "esbuild-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(wasm)|(bin)|(obj)$/i,
        include: [path.resolve(__dirname, "node_modules/deepar/")],
        type: "asset/resource",
      },
      {
        include: [path.resolve(__dirname, "effects/")],
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
      base: "/",
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, "./public"),
    open: true,
    compress: true,
    hot: true,
    port: 8888,
    allowedHosts: "all",
  },
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 10000000,
  },
};
