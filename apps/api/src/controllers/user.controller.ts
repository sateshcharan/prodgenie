import { Request, Response } from 'express';

import { UserService } from '@prodgenie/libs/db';

export class UserController {
  static async createUser(req: Request, res: Response) {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = req?.user?.id;

    const user = await UserService.deleteUser(userId);
    // res.json({ message: 'User deleted', user });
    res.json({ message: 'User deleted' });
  }

  static async getProfile(req: Request, res: Response) {
    // const userId = req.params.userId;

    // if (userId === 'me') {
    //   if (!req.user) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    //   }
    //   return res.json(req.user);
    // }

    const userId = req?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await UserService.getProfile(userId);
    res.json(user);
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = req?.user?.id;
    const { data } = req.body;

    const user = await UserService.updateProfile(userId, data);
    res.json(user);
  }
}
