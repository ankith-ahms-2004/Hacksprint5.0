import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail, updateUser } from '@/lib/services/userService';
import { verifyPassword, generateTokens } from '@/utils/auth';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in a user
 *     description: Authenticate a user with their email and password to receive access tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: farmer@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID
 *                     fullName:
 *                       type: string
 *                       description: User's full name
 *                     email:
 *                       type: string
 *                       description: User's email
 *                     phone:
 *                       type: string
 *                       description: User's phone number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Account creation timestamp
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last login timestamp
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await findUserByEmail(email);

    // If user doesn't exist or password is incorrect
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login time
    const now = new Date();
    await updateUser(user.id!, { lastLoginAt: now });

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id!,
      email: user.email,
    });

    // Return user data and tokens
    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString(),
      },
      tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 