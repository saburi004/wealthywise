// lib/authMiddleware.js
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function authenticate(request) {
  // Try to get token from cookies first, then headers
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authorization token required' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { 
      success: true,
      userId: decoded.userId,
      email: decoded.email 
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid or expired token',
        error: error.message 
      },
      { status: 403 }
    );
  }
}