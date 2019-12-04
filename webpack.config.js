const path = require('path');

module.exports = {
  entry: './piecewise_web/js/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
