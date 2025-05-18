import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail, createUser } from '@/lib/services/userService';
import { hashPassword, generateTokens } from '@/utils/auth';

// Validation schema for registration
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser = await createUser({
      fullName,
      email,
      phone,
      passwordHash,
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: newUser.id!,
      email: newUser.email,
    });

    // Return user data and tokens
    return NextResponse.json({
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt.toISOString(),
        lastLoginAt: newUser.lastLoginAt?.toISOString(),
      },
      tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 