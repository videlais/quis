import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfig = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
    },
  },
  optimization: {
    minimize: true,
  },
  externals: {
    // Don't bundle the generated parser - it's already built
    '../build/quis.cjs': 'commonjs ../build/quis.cjs',
  },
};

// CommonJS build configuration  
const cjsConfig = {
  ...baseConfig,
  entry: './src/index.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'quis-ts.cjs',
    library: {
      type: 'commonjs2',
    },
    clean: false,
  },
  externals: {
    '../build/quis.cjs': 'commonjs ./quis.cjs',
  },
};

// Web/Browser build configuration
const webConfig = {
  ...baseConfig,
  entry: './src/web-index.ts',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'quis.min.js',
    library: {
      name: 'quis',
      type: 'umd',
    },
    globalObject: 'typeof self !== "undefined" ? self : this',
    clean: false,
  },
  externals: {}, // Bundle everything for web
};

export default [cjsConfig, webConfig];