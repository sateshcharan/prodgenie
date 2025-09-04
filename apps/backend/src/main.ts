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
} from './routes';
import {
  // passport,
  // authenticatePassportJWT,
  errorHandler,
  asyncHandler,
  authenticateSupabaseJWT,
} from './middlewares';
import { AuthController } from './controllers';

const app = express();
const port = process.env.PORT || 3333;
const corsOptions = {
  origin: [
    'http://localhost:4200',
    'http://localhost:4300',
    'https://prodgenie.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'active-workspace-id'],
  credentials: true,
};

// // Webhook & Callback
app.use('/api/webhook', webhookRoutes);
app.get(`/auth/callback`, asyncHandler(AuthController.oAuthCallback));

// Middlewares
app.use(express.json());
// app.use(passport.initialize());
app.use(cors(corsOptions));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET!,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }, // set to true if using HTTPS in production
//   })
// );
app.use(cookieParser());

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
  apiRoutes.projectWide.base,
  // authenticatePassportJWT,
  authenticateSupabaseJWT,
  projectWideRoutes
);

// Error Handler
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
