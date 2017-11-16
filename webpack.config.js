const webpack = require('webpack');
const path = require('path');

const ExtractTextPlugin = require ('extract-text-webpack-plugin');

const precss = require('precss');
const autoprefixer = require('autoprefixer');
const bootstrapLoader = {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    precss,
                    autoprefixer
                  ];
                }
              }
            };


module.exports = {
  entry: [
    path.join(__dirname, 'src', 'app-client.js'),
    path.join(__dirname, 'src', 'scss', 'app.scss')
  ],
  output: {
    path: path.join(__dirname, 'src', 'static', 'js'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: path.join(__dirname, 'src'),
        loader: 'babel-loader',
        query: {
          cacheDirectory: 'babel_cache',
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', 
            'sass-loader',
            'postcss-loader'
          ]
        })
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new ExtractTextPlugin('../css/app.css'),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default']
      })
  ]
};