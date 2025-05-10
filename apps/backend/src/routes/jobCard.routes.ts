import express, { Router } from 'express';
import { JobCardController } from '../controllers/jobCard.controller';

const router: Router = express.Router();

router.post('/generate', JobCardController.generateJobCard);

export { router };
