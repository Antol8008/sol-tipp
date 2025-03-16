import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const donations = await prisma.donation.findMany({
      where: { recipient: { username: params.username } },
      orderBy: { createdAt: 'desc' },
      include: {
        donor: {
          select: {
            walletAddress: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { amount, comment, signature, walletAddress, recipientWallet, isDirectWalletTip } = await request.json();

    // Validate input
    if (!amount || !signature || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create donor profile
    let donor = await prisma.profile.findUnique({
      where: { walletAddress },
    });

    if (!donor) {
      donor = await prisma.profile.create({
        data: {
          walletAddress,
          username: walletAddress.slice(0, 8),
          displayName: `Anon ${walletAddress.slice(0, 4)}`,
        },
      });
    }

    let recipient;

    if (isDirectWalletTip) {
      // For direct wallet tips, create or get a minimal profile for the recipient
      recipient = await prisma.profile.findUnique({
        where: { walletAddress: recipientWallet },
      });

      if (!recipient) {
        recipient = await prisma.profile.create({
          data: {
            walletAddress: recipientWallet,
            username: recipientWallet.slice(0, 8),
            displayName: `Wallet ${recipientWallet.slice(0, 4)}...${recipientWallet.slice(-4)}`,
          },
        });
      }
    } else {
      // For registered users, get their profile by username
      recipient = await prisma.profile.findUnique({
        where: { username: params.username },
      });

      if (!recipient) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        amount,
        comment,
        signature,
        recipientId: recipient.id,
        donorId: donor.id,
      },
      include: {
        donor: {
          select: {
            walletAddress: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
} 