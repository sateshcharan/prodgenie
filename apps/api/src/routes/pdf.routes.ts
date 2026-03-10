import express, { Router } from 'express';

import { apiRoutes } from '@prodgenie/libs/constant';

import { PdfController } from '../controllers/pdf.controller';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { validateParsed } from '../middlewares/parsed.middleware';

const router: Router = express.Router();

router.post(
  apiRoutes.pdf.parse,
  validateParsed,
  asyncHandler(PdfController.extractPdfData)
);

export { router };
