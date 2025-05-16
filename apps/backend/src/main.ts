import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import passport, { authenticateJWT } from './middlewares/passport.middleware';
import errorHandler from './middlewares/error.middleware';

import {
  authRoutes,
  fileRoutes,
  userRoutes,
  pdfRoutes,
  jobCardRoutes,
  orgRoutes,
  paymentRoutes,
} from './routes';

import { apiRoutes } from '@prodgenie/libs/constant';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:4200', 'https://prodgenie.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(passport.initialize());

// Static Files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use(apiRoutes.auth.base, authRoutes);
app.use(apiRoutes.files.base, authenticateJWT, fileRoutes);
app.use(apiRoutes.users.base, authenticateJWT, userRoutes);
app.use(apiRoutes.pdf.base, authenticateJWT, pdfRoutes);
app.use(apiRoutes.jobCard.base, authenticateJWT, jobCardRoutes);
app.use(apiRoutes.payment.base, authenticateJWT, paymentRoutes);
app.use(apiRoutes.orgs.base, orgRoutes);
// Error Handler
app.use(errorHandler);

// Server
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
