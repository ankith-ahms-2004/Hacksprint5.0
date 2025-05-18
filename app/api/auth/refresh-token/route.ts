import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/services/userService';
import { verifyToken, generateTokens } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from request body
    let refreshToken;
    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch (e) {
      // No body or invalid JSON
    }

    // If no refresh token found
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const tokenPayload = verifyToken(refreshToken, true);

    // Check if user exists
    const user = await findUserById(tokenPayload.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id!,
      email: user.email,
    });

    // Return new tokens
    return NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not supported, use POST instead' },
    { status: 405 }
  );
} 