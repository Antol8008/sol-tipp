'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Explore page error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-8 text-center">
        We encountered an error while loading the creators. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-[#00E64D] text-white rounded-full font-semibold hover:bg-[#00CC44] transition-colors"
      >
        Try again
      </button>
    </div>
  );
} 