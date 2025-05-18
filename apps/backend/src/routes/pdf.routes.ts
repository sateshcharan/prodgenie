import express, { Router } from 'express';

import { PdfController } from '../controllers/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.pdf.parse, PdfController.extractPdfData);

export { router };
