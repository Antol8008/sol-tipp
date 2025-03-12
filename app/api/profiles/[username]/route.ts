import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { username: params.username },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const data = await request.json();
    const { displayName, bio, minimumTip, avatarUrl, bannerUrl, socialLinks } = data;

    // Validate the request
    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Get the current profile
    const currentProfile = await prisma.profile.findUnique({
      where: { username: params.username },
    });

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { username: params.username },
      data: {
        displayName,
        bio,
        minimumTip,
        avatarUrl,
        bannerUrl,
        socialLinks,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 