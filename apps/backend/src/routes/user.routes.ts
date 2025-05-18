import express, { Router } from 'express';

import { UserController } from '../controllers/index.js';

import { apiRoutes } from '@prodgenie/libs/constant';

const router: Router = express.Router();

router.post(apiRoutes.users.create, UserController.createUser);
router.get(apiRoutes.users.list(':orgId'), UserController.listUsers);
router.get(apiRoutes.users.update(':userId'), UserController.updateProfile);
router.get(apiRoutes.users.delete(':userId'), UserController.deleteUser);
router.get(apiRoutes.users.getProfile(':userId'), UserController.getProfile);

export { router };
