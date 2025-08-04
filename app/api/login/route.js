export const runtime = 'nodejs';
import dbConnect from '@/lib/dbconnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    
    // Find user and verify password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return NextResponse.json(
      { 
        user: userWithoutPassword, 
        token,
        message: 'Login successful' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}