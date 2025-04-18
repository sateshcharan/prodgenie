// user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../../../../libs/prisma/src/lib/user.service';

const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await userService.getProfile(userId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const updates = req.body;
      const user = await userService.updateProfile(userId, updates);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await userService.deleteUser(userId);
      res.json({ message: 'User deleted', user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async listUsers(_req: Request, res: Response) {
    try {
      const users = await userService.listUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
