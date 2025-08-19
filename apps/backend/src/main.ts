import path from 'path';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
// import session from 'express-session';

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
  errorHandler,
  passport,
  authenticatePassportJWT,
  authenticateSupabaseJWT,
  asyncHandler,
} from './middlewares';

import { apiRoutes } from '@prodgenie/libs/constant';
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
  // credentials: true,
};

// Webhook & Callback
app.use('/api/webhook', webhookRoutes);
// app.get(`/auth/callback`, asyncHandler(AuthController.oAuthCallback));

// Middlewares
app.use(express.json());
// app.use(passport.initialize());
app.use(cors(corsOptions));
// Static Files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET!,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }, // set to true if using HTTPS in production
//   })
// );

// Routes
app.use(apiRoutes.auth.base, authRoutes);
app.use(apiRoutes.workspace.base, workspaceRoutes);
app.use(apiRoutes.pdf.base, authenticateSupabaseJWT, pdfRoutes);
app.use(apiRoutes.files.base, authenticateSupabaseJWT, fileRoutes);
app.use(apiRoutes.users.base, authenticateSupabaseJWT, userRoutes);
app.use(apiRoutes.jobCard.base, authenticateSupabaseJWT, jobCardRoutes);
app.use(apiRoutes.payment.base, authenticateSupabaseJWT, paymentRoutes);
app.use(apiRoutes.thumbnail.base, authenticateSupabaseJWT, thumbnailRoutes);
app.use(apiRoutes.sequence.base, authenticateSupabaseJWT, sequenceRoutes);
app.use(apiRoutes.projectWide.base, authenticateSupabaseJWT, projectWideRoutes);
// app.use(apiRoutes.pdf.base, authenticatePassportJWT, pdfRoutes);
// app.use(apiRoutes.files.base, authenticatePassportJWT, fileRoutes);
// app.use(apiRoutes.users.base, authenticatePassportJWT, userRoutes);
// app.use(apiRoutes.jobCard.base, authenticatePassportJWT, jobCardRoutes);
// app.use(apiRoutes.payment.base, authenticatePassportJWT, paymentRoutes);
// app.use(apiRoutes.thumbnail.base, authenticatePassportJWT, thumbnailRoutes);
// app.use(apiRoutes.sequence.base, authenticatePassportJWT, sequenceRoutes);
// app.use(apiRoutes.projectWide.base, authenticatePassportJWT, projectWideRoutes);

// Error Handler
app.use(errorHandler);

// Server
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
