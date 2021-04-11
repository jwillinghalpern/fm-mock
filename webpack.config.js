const path = require('path');

module.exports = [
  {
    entry: path.resolve(__dirname, 'src/fm-mock.js'),
    target: 'es5',
    output: {
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'fm-mock.js',
      library: {
        name: 'FMMock',
        type: 'umd',
      },
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
      ],
    },
    mode: 'production',
  },
  {
    entry: path.resolve(__dirname, 'src/fm-mock.js'),
    output: {
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'fm-mock.mjs',
      library: {
        type: 'module',
      },
    },
    experiments: {
      outputModule: true,
    },
    mode: 'production',
  },
];
