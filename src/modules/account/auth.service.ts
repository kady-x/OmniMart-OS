import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../core/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supermarket_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export class AuthService {
  /**
   * DFD 1.0 Authentication & 1.1 Generate Session
   * Validates credentials against Users DB, then issues a JWT session token
   */
  public async login(credentials: { username: string; password: string }) {
    const { username, password } = credentials;

    // 1.0: Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or account is disabled.');
    }

    // Verify password hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role.toLowerCase(), username: user.username },
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return {
      userId: user.id,
      role: user.role.toLowerCase(),
      username: user.username,
      fullName: user.fullName,
      token,
      message: 'Authentication successful. Session generated.',
    };
  }

  /**
   * Register a new user (Manager only via API)
   */
  public async register(data: {
    username: string;
    password: string;
    role: string;
    fullName: string;
    email?: string;
    phone?: string;
  }) {
    const { username, password, role, fullName, email, phone } = data;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      throw new Error('Username already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role.toUpperCase() as any,
        fullName,
        email,
        phone,
      },
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get all staff members (Manager only)
   */
  public async getStaff() {
    const staff = await prisma.user.findMany({
      where: { role: { not: 'CUSTOMER' } },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return staff;
  }

  /**
   * Toggle user active status
   */
  public async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, username: true, isActive: true },
    });
  }
}
