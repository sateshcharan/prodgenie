import { Request, Response } from 'express';

import { UserService } from '@prodgenie/libs/db';

const userService = new UserService();

export class UserController {
  static async getProfile(req: Request, res: Response) {
    const userId = req.params.userId;

    if (userId === 'me') {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      return res.json(req.user);
    }

    const user = await userService.getProfile(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  }

  static async createUser(req: Request, res: Response) {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = req.params.userId;
    const updates = req.body;
    const user = await userService.updateProfile(userId, updates);
    res.json(user);
  }

  static async listUsers(req: Request, res: Response) {
    const orgId = req.params.orgId;
    const users = await userService.listUsers(orgId);
    res.json(users);
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = req.params.userId;
    const user = await userService.deleteUser(userId);
    res.json({ message: 'User deleted', user });
  }
}
