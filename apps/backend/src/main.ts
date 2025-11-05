import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
// import session from 'express-session';

import { apiRoutes } from '@prodgenie/libs/constant';

import {
  authRoutes,
  fileRoutes,
  userRoutes,
  pdfRoutes,
  jobCardRoutes,
  workspaceRoutes,
  paymentRoutes,
  thumbnailRoutes,
  sequenceRoutes,
  webhookRoutes,
  projectWideRoutes,
  sseRoutes,
  callbackRoutes,
  notificationRoutes,
} from './routes';
import {
  // passport,
  // authenticatePassportJWT,
  errorHandler,
  authenticateSupabaseJWT,
} from './middlewares';

const app = express();
const port = process.env.PORT || 3333;
const corsOptions = {
  origin: [
    'http://localhost:4200', // dev
    'http://localhost:4300', // preview
    'https://prodgenie.vercel.app', // prod
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'active-workspace-id'],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// app.use(passport.initialize());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET!,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }, // set to true if using HTTPS in production
//   })
// );

// Static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// // Webhook & Callback
app.use(apiRoutes.webhook.base, webhookRoutes);
app.use(apiRoutes.callback.base, callbackRoutes);

// Routes
app.use(apiRoutes.auth.base, authRoutes);
app.use(apiRoutes.workspace.base, workspaceRoutes);
app.use(
  apiRoutes.users.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  userRoutes
);
app.use(
  apiRoutes.pdf.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  pdfRoutes
);
app.use(
  apiRoutes.files.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  fileRoutes
);
app.use(
  apiRoutes.jobCard.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  jobCardRoutes
);
app.use(
  apiRoutes.payment.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  paymentRoutes
);
app.use(
  apiRoutes.thumbnail.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  thumbnailRoutes
);
app.use(
  apiRoutes.sequence.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  sequenceRoutes
);
app.use(
  apiRoutes.notification.base,
  authenticateSupabaseJWT,
  notificationRoutes
);
app.use(
  apiRoutes.projectWide.base,
  // authenticatePassportJWT,
  // authenticateSupabaseJWT,
  projectWideRoutes
);
app.use(apiRoutes.sse.base, sseRoutes);

// Error Handler
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
