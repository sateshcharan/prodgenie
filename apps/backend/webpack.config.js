const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

const supabaseLibPath = resolve(__dirname, '../../libs/supabase/src');
const prismaLibPath = resolve(__dirname, '../../libs/prisma/src');
const constantsLibPath = resolve(__dirname, '../../libs/constant/src');
const typesLibPath = resolve(__dirname, '../../libs/types/src');
const schemaLibPath = resolve(__dirname, '../../libs/schema/src');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      '@prodgenie/libs/schema': schemaLibPath,
      '@prodgenie/libs/supabase': supabaseLibPath,
      '@prodgenie/libs/prisma': prismaLibPath,
      '@prodgenie/libs/constant': constantsLibPath,
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
