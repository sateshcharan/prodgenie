import express, { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router: Router = express.Router();
const controller = new UserController();

router.get('/', controller.listUsers.bind(controller));
router.get('/:id', controller.getProfile.bind(controller));
router.post('/', controller.createUser.bind(controller));
router.put('/:id', controller.updateProfile.bind(controller));
router.delete('/:id', controller.deleteUser.bind(controller));

export default router;
