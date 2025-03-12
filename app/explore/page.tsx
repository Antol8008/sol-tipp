import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { SearchBar } from './components/SearchBar';
import { CreatorCard } from './components/CreatorCard';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Explore Creators | SOLTIPP',
  description: 'Discover and support amazing creators on SOLTIPP',
};

async function getCreators(search?: string) {
  try {
    const creators = await prisma.profile.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { displayName: { contains: search, mode: 'insensitive' } },
              { bio: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        minimumTip: true,
        _count: {
          select: {
            receivedDonations: true,
          },
        },
        receivedDonations: {
          select: {
            amount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return creators.map((creator) => {
      // Calculate total tips received in lamports
      const totalTipsReceived = creator.receivedDonations.reduce(
        (total, donation) => total + Math.floor(donation.amount * 1e9),
        0
      );

      return {
        username: creator.username,
        displayName: creator.displayName,
        avatarUrl: creator.avatarUrl,
        bio: creator.bio,
        minTipAmount: Math.floor(creator.minimumTip * 1e9), // Convert to lamports
        totalTipsReceived,
        lastTipReceivedAt: creator.receivedDonations[0]?.createdAt || null,
      };
    });
  } catch (error) {
    console.error('Error fetching creators:', error);
    return [];
  }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const creators = await getCreators(searchParams.q);

  return (
    <main className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading mb-4">
            Explore Creators
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover amazing creators and support their work with SOL tips.
            Every tip makes a difference!
          </p>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        {creators.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {creators.map((creator) => (
              <CreatorCard key={creator.username} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No creators found. Try adjusting your search.
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 