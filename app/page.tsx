import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, Zap, Clock, ChevronRight, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';

interface DonationUser {
  username: string;
  displayName: string | null;
  walletAddress?: string;
}

interface Donation {
  id: string;
  amount: number;
  comment: string | null;
  createdAt: Date;
  donor: DonationUser;
  recipient: DonationUser;
}

async function getRecentDonations(): Promise<Donation[]> {
  try {
    const donations = await prisma.donation.findMany({
      take: 6, 
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        donor: {
          select: {
            username: true,
            displayName: true,
            walletAddress: true,
          },
        },
        recipient: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    });
    return donations;
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    return [];
  }
}

export default async function Home() {
  const recentDonations = await getRecentDonations();
  
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold gradient-text">SOLTIPP</span>
          </div>
          <div className="flex items-center gap-4">
            {/* <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button> */}
            <Button className="bg-[#00E64D] hover:bg-[#00CC44] text-[#0F1611] rounded-full" asChild>
              <Link href="/create">Create Your Page</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[#00E64D]/5 backdrop-blur-3xl" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00E64D]/10 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 tracking-tight">
              Unlock earnings
              <br />
              with <span className="gradient-text">crypto</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              The easiest way to receive tips and support from your community using Solana.
              Fast, low-cost, and hassle-free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-[#00E64D] hover:bg-[#00CC44] text-[#0F1611] text-lg h-14 px-8 rounded-full group"
                asChild
              >
                <Link href="/create">
                  Create Your Page
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full border-2"
                asChild
              >
                <Link href="/explore">
                  Explore Creators
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-card">
                <div className="feature-icon">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Only 3% platform fee</h3>
                <p className="text-gray-600">Keep more of your earnings with our minimal platform fee. Direct transfers to your wallet.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">One-click page setup</h3>
                <p className="text-gray-600">Connect your wallet and start receiving tips instantly. No complex setup required.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Direct wallet transfers</h3>
                <p className="text-gray-600">Receive tips directly to your Solana wallet. No waiting periods or manual withdrawals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Tips Section */}
        <section className="py-24 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Recent Tips</h2>
              <p className="text-xl text-gray-600">See how the community supports their favorite creators</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDonations.map((donation) => (
                <Link 
                  key={donation.id}
                  href={`/${donation.recipient.username}`}
                  className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#00E64D] to-[#00CC44]">
                      <div className="absolute inset-0.5 bg-white rounded-full" />
                      <Gift className="absolute inset-2.5 w-7 h-7 text-[#00E64D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#00E64D] transition-colors">
                        {donation.donor.displayName || `Anon ${donation.donor.walletAddress?.slice(0, 4)}`}
                        <span className="mx-2">→</span>
                        <span className="font-semibold">@{donation.recipient.username}</span>
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#00E64D]/10 text-[#00CC44]">
                          {donation.amount.toFixed(2)} SOL
                        </span>
                      </div>
                      {donation.comment && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          "{donation.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-sm text-gray-500 group-hover:text-[#00E64D] transition-colors flex items-center">
                      View Profile
                      <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline"
                size="lg"
                className="rounded-full border-2"
                asChild
              >
                <Link href="/explore">
                  View All Tips
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}