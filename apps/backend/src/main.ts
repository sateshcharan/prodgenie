import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

import { authRoutes, fileRoutes } from './routes';

import passport from './middlewares/passport.middleware';

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

dotenv.config();
const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(cors(options));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
