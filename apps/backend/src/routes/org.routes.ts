import express, { Router } from 'express';
import { OrgController } from '../controllers/org.controller';

const router: Router = express.Router();

router.get('/check', OrgController.checkOrgExists);

export { router };
