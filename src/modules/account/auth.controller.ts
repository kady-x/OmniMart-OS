import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {

  public async login(req: Request, res: Response) {
    try {
      const credentials = req.body;
      if (!credentials.username || !credentials.password) {
        return res.status(400).json({ success: false, message: 'Username and password required.' });
      }
      const result = await authService.login(credentials);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  public async register(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.username || !data.password || !data.role) {
        return res.status(400).json({ success: false, message: 'Username, password, and role are required.' });
      }
      const result = await authService.register(data);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getStaff(req: Request, res: Response) {
    try {
      const staff = await authService.getStaff();
      res.status(200).json({ success: true, data: staff });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async toggleUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await authService.toggleUserStatus(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
