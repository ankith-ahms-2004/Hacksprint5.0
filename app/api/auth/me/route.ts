import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const tokenPayload = verifyToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile data
    return NextResponse.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
} 