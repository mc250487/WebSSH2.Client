const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, './src/js/index.js'),
    },
    devtool: 'inline-source-map',
    devServer: {
        static: './public'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: ['./src/index.html', './src/favicon.ico'],
        }),
        new MiniCssExtractPlugin()
    ],
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].bundle.js',
        clean: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        }
      ],
    }
}