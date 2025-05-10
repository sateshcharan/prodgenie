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

// Passport Middleware for protected routes
// app.use(passport.authenticate('jwt', { session: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', authenticateJWT, fileRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/pdf', authenticateJWT, pdfRoutes);
app.use('/api/jobCard', authenticateJWT, jobCardRoutes);
app.use('/api/payment', authenticateJWT, paymentRoutes);
app.use('/api/orgs', orgRoutes);
// Error Handler
app.use(errorHandler);

// Server
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
