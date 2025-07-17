const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

const supabaseLibPath = resolve(__dirname, '../../libs/supabase/src');
const prismaLibPath = resolve(__dirname, '../../libs/prisma/src');
const constantsLibPath = resolve(__dirname, '../../libs/constant/src');
const typesLibPath = resolve(__dirname, '../../libs/types/src');
const schemaLibPath = resolve(__dirname, '../../libs/schema/src');
const dbLibPath = resolve(__dirname, '../../libs/db/src');
const queuesLibPath = resolve(__dirname, '../../libs/queues/src');
const redisLibPath = resolve(__dirname, '../../libs/redis/src');
const serverServicesLibPath = resolve(
  __dirname,
  '../../libs/server-services/src'
);
const frontendServicesLibPath = resolve(
  __dirname,
  '../../libs/frontend-services/src'
);

module.exports = {
  externals: {
    puppeteer: 'commonjs puppeteer',
    'puppeteer-extra': 'commonjs puppeteer-extra',
    'puppeteer-extra-plugin-stealth': 'commonjs puppeteer-extra-plugin-stealth',
  },
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
      '@prodgenie/libs/db': dbLibPath,
      '@prodgenie/libs/queues': queuesLibPath,
      '@prodgenie/libs/redis': redisLibPath,
      '@prodgenie/libs/server-services': serverServicesLibPath,
      '@prodgenie/libs/frontend-services': frontendServicesLibPath,
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
