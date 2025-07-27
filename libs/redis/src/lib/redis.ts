// import IORedis from 'ioredis';

// export const connection = new IORedis({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: 6379,
//   maxRetriesPerRequest: null,
// });

// export const connection = {
//   host: process.env.REDIS_URL || 'localhost',
//   port: 6379,
//   maxRetriesPerRequest: null,
// };

import IORedis from 'ioredis';

export const connection = new IORedis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: null,
  }
);
