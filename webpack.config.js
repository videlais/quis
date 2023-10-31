const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/web-index.js',
  output: {
    filename: 'quis.min.js',
    path: path.resolve(__dirname, 'build'),
  },
};
