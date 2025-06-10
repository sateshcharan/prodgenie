import express, { Router } from 'express';

import { PdfController } from '../controllers/index.js';
import { validateParsed } from '../middlewares/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.pdf.parse, validateParsed, PdfController.extractPdfData);

export { router };
