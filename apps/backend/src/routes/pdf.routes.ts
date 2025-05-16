import express, { Router } from 'express';
import { PdfController } from '../controllers/pdf.controller';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.pdf.parse, PdfController.parsePdf);

export { router };
