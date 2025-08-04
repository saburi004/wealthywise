import dbConnect from '@/lib/dbconnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Get token from headers
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization token missing' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if requested user matches token owner
    if (params.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get user data
    const user = await User.findById(params.userId)
      .select('-password -refreshToken -__v');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        panCardNumber: user.panCardNumber,
        dateOfBirth: user.dateOfBirth,
        bankName: user.bankName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}