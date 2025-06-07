'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 z-50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
            PolkaNFT
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/gallery" 
            className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
          >
            Gallery
          </Link>
          <Link 
            href="/auctions" 
            className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
          >
            Auctions
          </Link>
          <Link 
            href="/mint" 
            className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
          >
            Create
          </Link>
          <Link 
            href="/profile" 
            className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
          >
            Profile
          </Link>
        </nav>

        {/* Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search NFTs, collections..."
              className="glass border-white/20 pl-10 focus:border-pink-400 focus:ring-pink-400/20 bg-white/5"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <WalletConnect />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search NFTs, collections..."
                  className="glass border-white/20 pl-10 bg-white/5"
                />
              </div>
              
              {/* Navigation Links */}
              <div className="space-y-2">
                <Link 
                  href="/gallery" 
                  className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Gallery
                </Link>
                <Link 
                  href="/auctions" 
                  className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Auctions
                </Link>
                <Link 
                  href="/mint" 
                  className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create
                </Link>
                <Link 
                  href="/profile" 
                  className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}