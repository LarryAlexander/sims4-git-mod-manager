const path = require('path');

module.exports = [
  // Main process
  {
    target: 'electron-main',
    entry: './src/main/main.ts',
    output: {
      path: path.resolve(__dirname, 'dist/main'),
      filename: 'main.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: {
      electron: 'commonjs electron',
      sqlite3: 'commonjs sqlite3',
      'simple-git': 'commonjs simple-git',
      chokidar: 'commonjs chokidar',
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  },
  // Preload script
  {
    target: 'electron-preload',
    entry: './src/main/preload.ts',
    output: {
      path: path.resolve(__dirname, 'dist/main'),
      filename: 'preload.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: {
      electron: 'commonjs electron',
    },
    node: {
      __dirname: false,
      __filename: false,
    },
  },
];