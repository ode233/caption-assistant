const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const rootDir = path.join(__dirname, "..");
HtmlWebpackPlugin = require('html-webpack-plugin'),

module.exports = {
    entry: {
      popup: path.join(rootDir, 'src', 'pages', 'popup', 'popup.tsx'),
      background: path.join(rootDir, 'src', 'pages', 'background',  'background.ts'),
      content_script: path.join(rootDir, 'src', 'pages', 'content',  'content_script.tsx'),
      inject: path.join(rootDir, 'src', 'pages', 'content',  'inject.js'),
    },
    output: {
        path: path.join(rootDir, "dist"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks(chunk) {
              return chunk.name !== 'background';
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
              {
                from: path.join(rootDir, 'src', 'manifest.json'),
                to: path.join(rootDir, 'dist'),
                force: true,
                transform: function (content, path) {
                  // generates the manifest file using the package.json informations
                  return Buffer.from(
                    JSON.stringify({
                      description: process.env.npm_package_description,
                      version: process.env.npm_package_version,
                      ...JSON.parse(content.toString()),
                    })
                  );
                },
              },
            ],
          }),
        new CopyPlugin({
            patterns: [
              {
                from: path.join(rootDir, 'src', 'assets', 'icons'),
                to: path.join(rootDir, 'dist', 'assets', 'icons'),
                force: true,
              },
            ],
          }),
          new HtmlWebpackPlugin({
            template: path.join(rootDir, 'src', 'pages', 'popup', 'popup.html'),
            filename: 'popup.html',
            chunks: ['popup'],
            cache: false,
          }),
    ],
};
