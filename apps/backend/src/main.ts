import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

import { authRoutes, fileRoutes, userRoutes } from './routes';
import { apiRoutes } from '@prodgenie/libs/constant';

import passport from './middlewares/passport.middleware';

dotenv.config();
const app = express();
const allowedOrigins = [
  'http://localhost:4200',
  'https://prodgenie.vercel.app',
];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(express.json());
app.use(cors(options));
app.use(passport.initialize());

app.use(apiRoutes.api.url, authRoutes);
app.use(apiRoutes.api.url, fileRoutes);
app.use(apiRoutes.api.url, userRoutes);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
