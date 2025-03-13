import Link from 'next/link';
import { Twitter, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold gradient-text">
              SOLTIPP
            </Link>
            <p className="text-gray-600 font-jakarta">
              The easiest way to receive tips and support from your community using Solana.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="text-gray-400 cursor-not-allowed"
                title="Coming Soon"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/Antol8008/sol-tipp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#00E64D] transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-3 font-jakarta">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-[#00E64D] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-[#00E64D] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-[#00E64D] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-3 font-jakarta">
                <li>
                  <a 
                    href="https://solana.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#00E64D] transition-colors"
                  >
                    Solana
                  </a>
                </li>
                <li>
                  <a 
                    href="https://phantom.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#00E64D] transition-colors"
                  >
                    Phantom Wallet
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t mt-12 pt-8">
          <p className="text-center text-gray-500 font-jakarta text-sm">
            © {new Date().getFullYear()} SOLTIPP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 