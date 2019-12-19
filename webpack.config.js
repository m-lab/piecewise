require('dotenv').config();
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(s*)css$/i,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('precss'),
                  require('autoprefixer')
                ];
              }
            }
          },
          {loader: 'sass-loader'}
        ],
      },
    ],
  },
  entry: './static/js/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // devServer: {
  //   contentBase: path.join(__dirname, 'dist'),
  //   compress: true,
  //   port: 8080
  // }
};
