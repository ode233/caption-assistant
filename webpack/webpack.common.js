/* eslint-disable @typescript-eslint/no-require-imports */
const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rootDir = path.join(__dirname, '..');
module.exports = {
    entry: {
        popup: path.join(rootDir, 'src/components/popup/popup.tsx'),
        options: path.join(rootDir, 'src/components/options/options.tsx'),
        background: path.join(rootDir, 'src/components/background/background.ts'),
        '/watchVideo/netflix/content': path.join(rootDir, 'src/components/content/watchVideo/netflix/content.tsx'),
        '/watchVideo/netflix/inject': path.join(rootDir, 'src/components/content/watchVideo/netflix/inject.ts'),
        '/translate/content': path.join(rootDir, 'src/components/content/translate/content.tsx')
    },
    output: {
        path: path.join(rootDir, 'dist'),
        filename: '[name].js'
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks(chunk) {
                const notChunks = ['background', 'popup', 'options'];
                return !notChunks.includes(chunk.name);
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'style-loader' // Creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // Translates CSS into CommonJS
                    },
                    {
                        loader: 'sass-loader' // Compiles Sass to CSS
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
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
                                ...JSON.parse(content.toString())
                            })
                        );
                    }
                },
                {
                    from: path.join(rootDir, 'src', 'assets', 'icons'),
                    to: path.join(rootDir, 'dist', 'assets', 'icons'),
                    force: true
                },
                {
                    from: path.join(rootDir, 'src', 'components', 'popup', 'popup.html'),
                    to: path.join(rootDir, 'dist'),
                    force: true
                },
                {
                    from: path.join(rootDir, 'src', 'components', 'options', 'options.html'),
                    to: path.join(rootDir, 'dist'),
                    force: true
                }
            ]
        })
    ]
};
