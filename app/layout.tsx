import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Toaster } from 'sonner';
import { ContractInitializer } from '@/components/ContractInitializer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'PassetNFT - Premium NFT Marketplace on Passet Hub',
  description: 'Discover, create, and trade NFTs on the Passet Hub testnet. The premier destination for digital collectibles.',
  keywords: ['NFT', 'Passet Hub', 'Blockchain', 'Digital Art', 'Collectibles', 'PAS'],
  authors: [{ name: 'PassetNFT Team' }],
  openGraph: {
    title: 'PassetNFT - Premium NFT Marketplace',
    description: 'Discover, create, and trade NFTs on Passet Hub testnet',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PassetNFT - Premium NFT Marketplace',
    description: 'Discover, create, and trade NFTs on Passet Hub testnet',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0f0f23" />
      </head>
      <body className={inter.className}>
        {/* Optimized Particle Background */}
        <div className="particles">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-pink-400 rounded-full opacity-${Math.random() > 0.5 ? '20' : '10'} animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <ContractInitializer />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </div>

        <Toaster 
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  );
}