import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;
      const result = await userService.register(email, name, password);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}