import express, { Router } from 'express';
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
router.post(`/updateUser/:userId`, updateProfile);
router.get(`/listUsers/:orgId`, listUsers);
router.delete(`/deleteUser/:userId`, deleteUser);

export { router };
