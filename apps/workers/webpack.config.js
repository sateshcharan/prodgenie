const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

const dbLibPath = resolve(__dirname, '../../libs/db/src');
const sseLibPath = resolve(__dirname, '../../libs/sse/src');
const typesLibPath = resolve(__dirname, '../../libs/types/src');
const redisLibPath = resolve(__dirname, '../../libs/redis/src');
const prismaLibPath = resolve(__dirname, '../../libs/prisma/src');
const schemaLibPath = resolve(__dirname, '../../libs/schema/src');
const queuesLibPath = resolve(__dirname, '../../libs/queues/src');
const supabaseLibPath = resolve(__dirname, '../../libs/supabase/src');
const constantsLibPath = resolve(__dirname, '../../libs/constant/src');
const sharedUtilsLibPath = resolve(__dirname, '../../libs/shared-utils/src');
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
      '@prodgenie/libs/shared-utils': sharedUtilsLibPath,
      '@prodgenie/libs/sse': sseLibPath,
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
