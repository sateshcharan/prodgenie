import { Request, Response } from 'express';
import { UserService } from '@prodgenie/libs/prisma';

const userService = new UserService();

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const user = await userService.getProfile(userId);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const user = await userService.updateProfile(userId, updates);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const user = await userService.deleteUser(userId);
    res.json({ message: 'User deleted', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function listUsers(req: Request, res: Response) {
  const orgName = req.params.orgName;
  try {
    const users = await userService.listUsers(orgName);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
