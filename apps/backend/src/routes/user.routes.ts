import express, { Router } from 'express';
import { apiRoutes } from '@prodgenie/libs/constant';
import {
  getProfile,
  createUser,
  updateProfile,
  deleteUser,
  listUsers,
} from '../controllers/user.controller';

const router: Router = express.Router();

router.get(`/getProfile/:userId`, getProfile);
router.post(`/createUser`, createUser);
router.post(`/updateProfile/:userId`, updateProfile);
router.delete(`/deleteUser/:userId`, deleteUser);
router.get(`/listUsers/:orgName`, listUsers);

export default router;
