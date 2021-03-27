const path = require('path');

module.exports = [
  {
    entry: path.resolve(__dirname, 'src/fm-mock.js'),
    output: {
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: 'fm-mock.js',
      library: {
        name: 'FMMock',
        type: 'umd',
        export: 'default',
        // umdNamedDefine: true,
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
];
