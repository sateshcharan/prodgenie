import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';

// import session from 'express-session';

import { apiRoutes } from '@prodgenie/libs/constant';

import { router as authRoutes } from './routes/auth.routes';
import { router as adminRoutes } from './routes/admin.routes';
import { router as userRoutes } from './routes/user.routes';
import { router as fileRoutes } from './routes/file.routes';
import { router as pdfRoutes } from './routes/pdf.routes';
import { router as jobCardRoutes } from './routes/jobCard.routes';
import { router as workspaceRoutes } from './routes/workspace.routes';
import { router as paymentRoutes } from './routes/payment.routes';
import { router as thumbnailRoutes } from './routes/thumbnail.routes';
import { router as sequenceRoutes } from './routes/sequence.routes';
import { router as webhookRoutes } from './routes/webhook.routes';
import { router as sseRoutes } from './routes/sse.routes';
import { router as batchedRoutes } from './routes/batched.routes';
import { router as callbackRoutes } from './routes/callback.routes';
import { router as subscribeRoutes } from './routes/subscribe.routes';
import { router as projectWideRoutes } from './routes/projectWide.routes';
import { router as notificationRoutes } from './routes/notification.routes';

// import passport from 'passport';
// import { passport } from './middlewares/passport.middleware';
// import { authenticatePassportJWT } from './middlewares/passport.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { authenticateSupabaseJWT } from './middlewares/supabase.middleware';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middlewares
app.use(compression());
app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4300',
      'https://prodgenie.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'active-workspace-id'],
    maxAge: 86400, // caches static assests
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// app.use(passport.initialize());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET! || "replacewithsecuresecret",
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
  apiRoutes.admin.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  adminRoutes
);
// === future feature ===
// app.use(
//   apiRoutes.notification.base,
//   authenticateSupabaseJWT,
//   notificationRoutes
// );
app.use(
  apiRoutes.projectWide.base,
  // authenticatePassportJWT,
  // authenticateSupabaseJWT,
  projectWideRoutes
);
app.use(apiRoutes.batched.base, authenticateSupabaseJWT, batchedRoutes);
app.use(apiRoutes.sse.base, sseRoutes);
app.use(apiRoutes.subscribe.base, subscribeRoutes);

// Error Handler
app.use(errorHandler);

// Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
