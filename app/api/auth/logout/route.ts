import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // With token-based auth stored in localStorage, the client is responsible for clearing tokens
  // The server doesn't need to do anything special for logout
  return NextResponse.json({ success: true });
} 