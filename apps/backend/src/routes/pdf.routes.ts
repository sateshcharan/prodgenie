import express, { Router } from 'express';
import { PdfController } from '../controllers/pdf.controller';

const router: Router = express.Router();

router.post('/parse', PdfController.parsePdf);

export { router };
