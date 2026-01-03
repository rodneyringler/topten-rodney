import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been generated',
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In a production app, you would send an email here with the reset link
    // For this demo, we'll include the token in the response
    // The reset URL would be: /auth/reset-password?token={resetToken}
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    console.log('Password reset link (for demo purposes):', resetUrl);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been generated',
      // Include token for demo purposes - remove in production
      data: { resetToken, resetUrl },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
