import dbConnect from '@/lib/dbconnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user with just email and password
    const user = new User({
      email,
      password
    });

    await user.save();

    // Return user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return NextResponse.json(
      { 
        user: userWithoutPassword, 
        message: 'Registration successful' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        message: 'Registration failed',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}