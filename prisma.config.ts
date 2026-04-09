import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'libs/db/prisma/schema.prisma',
  migrations: {
    path: 'libs/db/prisma/migrations',
  },
  // datasource: {
  //   url: env('DATABASE_URL'),
  // },
});
