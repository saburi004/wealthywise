export const runtime = 'nodejs';
import dbConnect from '@/lib/dbconnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password, action = 'login', ...userData } = await request.json();
    
    if (action === 'register') {
      // Registration logic
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists with this email' },
          { status: 400 }
        );
      }

      const user = new User({
        email,
        password,
        ...userData
      });

      await user.save();

      // Generate token for new user
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return user without password
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      const response = NextResponse.json(
        { 
          user: userWithoutPassword, 
          token,
          message: 'Registration successful' 
        },
        { status: 201 }
      );

      // Set token in cookie
      response.cookies.set('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return response;

    } else {
      // Login logic
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

      const response = NextResponse.json(
        { 
          user: userWithoutPassword, 
          token,
          message: 'Login successful' 
        },
        { status: 200 }
      );

      // Set token in cookie
      response.cookies.set('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return response;
    }

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 