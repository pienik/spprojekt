const path = require('path');

module.exports = {
  entry: './loop-learning-game.jsx',
  output: {
    filename: 'loop-learning-game.js',
    path: path.resolve(__dirname, '.')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  }
};
