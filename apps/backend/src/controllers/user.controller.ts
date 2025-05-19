import { Request, Response } from 'express';

import { UserService } from '@prodgenie/libs/db';

const userService = new UserService();

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      if (userId === 'me') {
        if (!req.user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        return res.json(req.user); // early return
      }

      const user = await userService.getProfile(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const updates = req.body;
      const user = await userService.updateProfile(userId, updates);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async listUsers(req: Request, res: Response) {
    const orgId = req.params.orgId;
    try {
      const users = await userService.listUsers(orgId);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await userService.deleteUser(userId);
      res.json({ message: 'User deleted', user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
