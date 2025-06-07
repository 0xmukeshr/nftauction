'use client';

import { NFTCard } from './NFTCard';
import { motion } from 'framer-motion';
import type { NFT } from '@/types/nft';

interface NFTGridProps {
  nfts: NFT[];
  loading?: boolean;
  emptyMessage?: string;
  auctions?: Record<string, {
    currentPrice: number;
    endTime: Date;
    totalBids: number;
  }>;
}

export function NFTGrid({ 
  nfts, 
  loading = false, 
  emptyMessage = "No NFTs found",
  auctions = {}
}: NFTGridProps) {
  if (loading) {
    return <NFTGridSkeleton />;
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-4xl">🎨</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft, index) => (
        <motion.div
          key={nft.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <NFTCard 
            nft={nft} 
            auction={auctions[nft.id]}
          />
        </motion.div>
      ))}
    </div>
  );
}

function NFTGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="glass rounded-xl overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 shimmer" />
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded shimmer" />
              <div className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded w-2/3 shimmer" />
            </div>
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded w-12 shimmer" />
                <div className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-16 shimmer" />
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded w-8 shimmer" />
                <div className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-6 shimmer" />
              </div>
            </div>
            <div className="h-9 bg-gradient-to-r from-white/10 to-white/5 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}