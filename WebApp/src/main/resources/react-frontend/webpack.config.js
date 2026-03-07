const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const DROP_CONSOLE = process.env.DROP_CONSOLE !== 'false';

module.exports = {
  entry: './build-entry.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'static/js/main.[contenthash:8].js',
    clean: true,
    publicPath: '/'
  },
  mode: 'production',
  devtool: false,
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@mui/material': 'MaterialUI',
    'axios': 'axios'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: DROP_CONSOLE,
            drop_debugger: true
          },
          mangle: true,
          output: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index-build.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'app-bg.png', to: 'app-bg.png' },
        { from: 'theme.css', to: 'theme.css' },
        { from: 'config.js', to: 'config.js' }
      ]
    })
  ]
};
