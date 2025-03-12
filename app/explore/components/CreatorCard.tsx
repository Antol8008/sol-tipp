import { formatSolAmount } from '@/app/lib/format';
import { formatDistanceToNow } from 'date-fns';
import { Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CreatorCardProps {
  creator: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    totalTipsReceived: number;
    minTipAmount: number;
    lastTipReceivedAt: Date | null;
  };
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link
      href={`/${creator.username}`}
      className="block p-6 rounded-2xl border border-gray-200 hover:border-[#00E64D] transition-colors bg-white hover:shadow-lg"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-[#00E64D] to-[#00CC44]">
          {creator.avatarUrl ? (
            <Image
              src={creator.avatarUrl}
              alt={creator.displayName || creator.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-heading font-bold text-lg">
            {creator.displayName || creator.username}
          </h3>
          <p className="text-gray-500">@{creator.username}</p>
        </div>
      </div>
      <div className="mb-4 min-h-[48px]">
        <p className="text-gray-700 line-clamp-2">
          {creator.bio || "This creator hasn't added a bio yet"}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <div>
          <span className="font-semibold text-black">
            {formatSolAmount(creator.totalTipsReceived)}
          </span>{' '}
          total tips
        </div>
        <div>
          Min tip:{' '}
          <span className="font-semibold text-black">
            {formatSolAmount(creator.minTipAmount)}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {creator.lastTipReceivedAt ? (
          <>Last tip {formatDistanceToNow(creator.lastTipReceivedAt, { addSuffix: true })}</>
        ) : (
          'No tips received yet'
        )}
      </div>
    </Link>
  );
} 