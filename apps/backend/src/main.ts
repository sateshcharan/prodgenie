import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import fileRoutes from './routes/file.routes';
import userRoutes from './routes/user.routes';
import pdfRoutes from './routes/pdf.routes';
import passport from './middlewares/passport.middleware';
import errorHandler from './middlewares/error.middleware';
import { validateFileType } from './middlewares/fileType.middleware';

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
app.use(errorHandler);

app.use('/api', authRoutes);
app.use('/api/files/:fileType', validateFileType, fileRoutes);
app.use('/api', userRoutes);
app.use('/api/pdf', pdfRoutes);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
