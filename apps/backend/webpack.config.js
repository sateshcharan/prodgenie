const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

const supabaseLibPath = resolve(__dirname, '../../libs/supabase/src');
const constantsLibPath = resolve(__dirname, '../../libs/constants/src');
const typesLibPath = resolve(__dirname, '../../libs/types/src');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.ts$/,
  //       include: [join(__dirname, 'src'), supabaseLibPath],
  //       loader: 'ts-loader',
  //       options: {
  //         configFile: join(__dirname, 'tsconfig.app.json'),
  //       },
  //     },
  //   ],
  // },
  resolve: {
    alias: {
      '@prodgenie/libs/supabase': supabaseLibPath,
      '@prodgenie/libs/constants': constantsLibPath,
      '@prodgenie/libs/types': typesLibPath,
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
