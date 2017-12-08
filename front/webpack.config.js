const path = require("path");

module.exports = {
  entry: {
    main: "./src/main.ts",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "built"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
        { test: /\.ts$/, loader: "light-ts-loader", exclude: /node_modules/ },
    ],
  },
};
