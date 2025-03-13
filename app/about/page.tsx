import { Rocket, Zap, Shield, Github, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#00E64D]/10 to-transparent py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Empowering Creators with Crypto
          </h1>
          <p className="text-xl text-gray-600 font-jakarta">
            Making crypto tipping accessible, fast, and hassle-free for everyone.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-bold font-heading mb-6">Our Story</h2>
          <div className="space-y-6 font-jakarta text-gray-600">
            <p>
              SOLTIPP started with a simple realization. As a developer and content creator,
              I frequently used BuyMeACoffee to receive support from my community. While the
              platform was great, I often found myself waiting days for payments to clear and
              losing a significant portion to fees.
            </p>
            <p>
              Being deeply involved in Web3 and particularly impressed by Solana&apos;s
              capabilities, I saw an opportunity to revolutionize creator tipping. The idea
              was straightforward: build a platform that could process tips instantly with
              minimal fees, all while being as user-friendly as traditional platforms.
            </p>
            <p>
              What began as a side project to solve my own needs quickly evolved into
              something bigger. I realized that by leveraging Solana&apos;s lightning-fast
              infrastructure and wrapping it in a beautiful, intuitive interface, we could
              create a superior experience for creators worldwide.
            </p>
            <p>
              Today, SOLTIPP represents the bridge between traditional tipping platforms
              and the future of Web3, making crypto transactions accessible to everyone.
            </p>
          </div>
        </div>

        {/* Founder Card */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mt-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#00E64D] to-[#00CC44] flex items-center justify-center">
                <img 
                  src="image.png"
                  alt="Antol8008's avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold font-heading mb-2">Antol8008</h3>
              <p className="text-gray-600 font-jakarta mb-4">
                Full-Stack Developer and Blockchain Enthusiast specializing in Web2 + Web3 technologies. 
                Passionate about DeFi, NFTs, and building secure, scalable blockchain solutions. 
                Currently expanding skills in Python, React.js, and Solidity.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <Link
                  href="https://github.com/Antol8008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#00E64D] transition-colors"
                >
                  <Github className="h-6 w-6" />
                </Link>
                {/* <Link
                  href="https://twitter.com/soltipp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#00E64D] transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold font-heading mb-12 text-center">Why Choose SOLTIPP?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-[#00E64D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-6 w-6 text-[#00E64D]" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2">Lightning Fast</h3>
            <p className="text-gray-600 font-jakarta">
              Transactions complete in seconds, not days. No more waiting for payments to clear.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-[#00E64D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-[#00E64D]" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2">Secure & Transparent</h3>
            <p className="text-gray-600 font-jakarta">
              Built on Solana&apos;s secure blockchain with full transaction transparency.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-[#00E64D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-[#00E64D]" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2">Low Fees</h3>
            <p className="text-gray-600 font-jakarta">
              Just 3% platform fee. Keep more of what you earn with minimal transaction costs.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-[#00E64D]/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-heading mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 font-jakarta max-w-2xl mx-auto">
            To revolutionize creator support by providing the fastest, most accessible way to
            receive tips using the power of Solana, making crypto transactions as simple as
            traditional payments.
          </p>
        </div>
      </div>
    </div>
  );
} 