import dbConnect from '@/lib/dbconnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/authMiddleware';

export async function PUT(request) {
  try {
    await dbConnect();
    
    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { userId } = authResult;
    const updateData = await request.json();

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { password, email, ...safeUpdateData } = updateData;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...safeUpdateData,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        panCardNumber: updatedUser.panCardNumber,
        dateOfBirth: updatedUser.dateOfBirth,
        bankName: updatedUser.bankName,
        email: updatedUser.email
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { userId } = authResult;

    // Get user data
    const user = await User.findById(userId)
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
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
} 