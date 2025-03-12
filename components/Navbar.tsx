'use client';

import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { connected } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            SOLTIPP
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {!connected && (
            <Button className="bg-[#00E64D] hover:bg-[#00CC44] text-black font-medium rounded-full px-6" asChild>
              <Link href="/create">Create Your Page</Link>
            </Button>
          )}
          <div className="wallet-button-wrapper">
            <style jsx>{`
              .wallet-button-wrapper :global(.wallet-adapter-button) {
                background: #00E64D !important;
                color: black !important;
                font-family: inherit !important;
                font-weight: 500 !important;
                padding: 0 24px !important;
                border-radius: 9999px !important;
                height: 40px !important;
                transition: all 0.2s !important;
              }
              .wallet-button-wrapper :global(.wallet-adapter-button:hover) {
                background: #00CC44 !important;
                color: black !important;
              }
              .wallet-button-wrapper :global(.wallet-adapter-button-start-icon) {
                margin-right: 8px !important;
              }
            `}</style>
            <WalletMultiButton />
          </div>
        </div>
      </nav>
    </header>
  );
}