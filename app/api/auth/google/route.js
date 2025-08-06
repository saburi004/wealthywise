export const runtime = 'nodejs';
import dbConnect from '@/lib/dbconnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, name, photoURL, googleId } = await request.json();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        photo: photoURL,
        googleId,
        password: googleId, // You can hash this if needed but not required for OAuth-only accounts
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const response = NextResponse.json(
      { user: userWithoutPassword, token, message: 'Google login successful' },
      { status: 200 }
    );

    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return response;

  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
