var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');
var dotenv = require('dotenv');

dotenv.load();

module.exports = {
  context: path.join(__dirname, "src"),
  devtool: debug ? "inline-sourcemap" : null,
  devServer: {
    inline: true,
    port: 3000
  },
  entry: "./js/client.js",
  output: {
    path: __dirname + "/src/",
    filename: "client.min.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
          plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'],
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json']
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};