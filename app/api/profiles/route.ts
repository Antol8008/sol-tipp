import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const profile = await prisma.profile.create({
      data: {
        walletAddress: body.walletAddress,
        username: body.username,
        displayName: body.displayName,
        bio: body.bio || null,
        minimumTip: body.minimumTip,
        avatarUrl: body.avatarUrl || null,
        bannerUrl: body.bannerUrl || null,
        socialLinks: body.socialLinks,
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error creating profile:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
} 