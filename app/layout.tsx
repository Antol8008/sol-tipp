import './globals.css';
import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from '@/components/providers/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: 'SOLTIPP - Support Creators with Solana',
  description: 'The easiest way to support creators with Solana. One-click tipping platform with minimal fees.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jakarta.variable} font-sans`} suppressHydrationWarning>
        <WalletProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </WalletProvider>
      </body>
    </html>
  );
}