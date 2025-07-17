import express from 'express';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';

import {
  authRoutes,
  fileRoutes,
  userRoutes,
  pdfRoutes,
  jobCardRoutes,
  orgRoutes,
  paymentRoutes,
  thumbnailRoutes,
  sequenceRoutes,
} from './routes';
import {
  errorHandler,
  passport,
  authenticatePassportJWT,
  authenticateSupabase,
} from './middlewares';

import { apiRoutes } from '@prodgenie/libs/constant';

const app = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(express.json());
app.use(passport.initialize());
app.use(
  cors({
    origin: ['http://localhost:4200', 'https://prodgenie.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Static Files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use(apiRoutes.auth.base, authRoutes);
app.use(apiRoutes.orgs.base, orgRoutes);
app.use(apiRoutes.pdf.base, authenticatePassportJWT, pdfRoutes);
app.use(apiRoutes.files.base, authenticatePassportJWT, fileRoutes);
app.use(apiRoutes.users.base, authenticatePassportJWT, userRoutes);
app.use(apiRoutes.jobCard.base, authenticatePassportJWT, jobCardRoutes);
app.use(apiRoutes.payment.base, authenticatePassportJWT, paymentRoutes);
app.use(apiRoutes.thumbnail.base, authenticatePassportJWT, thumbnailRoutes);
app.use(apiRoutes.sequence.base, authenticatePassportJWT, sequenceRoutes);

// Error Handler
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
