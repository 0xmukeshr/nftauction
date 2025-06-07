'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Eye, Clock, Zap, Gavel, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BidModal } from '@/components/auction/BidModal';
import type { NFT } from '@/types/nft';

interface AuctionData {
  id: string;
  currentPrice: number;
  endTime: Date;
  totalBids: number;
  highestBidder?: string;
  reservePrice?: number;
  buyNowPrice?: number;
}

interface NFTCardProps {
  nft: NFT;
  showActions?: boolean;
  auction?: AuctionData;
}

export function NFTCard({ nft, showActions = true, auction }: NFTCardProps) {
  const [showBidModal, setShowBidModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} PAS`;
  };

  const formatTimeLeft = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isAuctionEnding = auction && (auction.endTime.getTime() - Date.now()) < 3600000; // 1 hour
  const isAuctionEnded = auction && auction.endTime.getTime() <= Date.now();

  const handleBuyNow = () => {
    // Implement buy now functionality
    console.log('Buy now clicked for NFT:', nft.id);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group"
      >
        <div className={`glass-hover rounded-xl overflow-hidden tilt-card ${
          isAuctionEnding ? 'pulse-glow border-red-500/50' : 'neon-pink'
        }`}>
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={nft.metadata.image || 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg'}
              alt={nft.metadata.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                size="sm" 
                variant="ghost" 
                className="glass w-8 h-8 p-0"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Link href={`/nft/${nft.id}`}>
                <Button size="sm" variant="ghost" className="glass w-8 h-8 p-0">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Auction Status */}
            {auction && (
              <div className="absolute top-3 left-3 space-y-2">
                {/* Timer */}
                <div className={`glass rounded-lg px-2 py-1 ${
                  isAuctionEnding ? 'bg-red-500/20 border-red-500/50' : 
                  isAuctionEnded ? 'bg-gray-500/20 border-gray-500/50' : ''
                }`}>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {isAuctionEnded ? 'Ended' : formatTimeLeft(auction.endTime)}
                    </span>
                  </div>
                </div>

                {/* Reserve Met Indicator */}
                {auction.reservePrice && auction.currentPrice >= auction.reservePrice && (
                  <div className="glass rounded-lg px-2 py-1 bg-green-500/20 border-green-500/50">
                    <span className="text-xs font-medium text-green-400">Reserve Met</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-2">
              <h3 className="font-semibold text-white truncate group-hover:text-pink-400 transition-colors">
                {nft.metadata.name}
              </h3>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <User className="w-3 h-3" />
                <span>By {formatAddress(nft.creator)}</span>
              </div>
            </div>

            {/* Price/Bid Info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-400">
                  {auction ? 'Current Bid' : nft.price ? 'Price' : 'Not for sale'}
                </div>
                <div className="font-bold text-pink-400">
                  {auction ? formatPrice(auction.currentPrice) : 
                   nft.price ? formatPrice(nft.price) : '—'}
                </div>
              </div>
              
              {auction && (
                <div className="text-right">
                  <div className="text-xs text-gray-400">Bids</div>
                  <div className="font-medium">{auction.totalBids}</div>
                </div>
              )}
            </div>

            {/* Reserve Price Info */}
            {auction?.reservePrice && auction.currentPrice < auction.reservePrice && (
              <div className="mb-3 p-2 glass rounded-lg border border-yellow-500/50">
                <div className="text-xs text-yellow-400">
                  Reserve: {formatPrice(auction.reservePrice)}
                </div>
              </div>
            )}

            {/* Attributes Preview */}
            {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {nft.metadata.attributes.slice(0, 2).map((attr, index) => (
                  <span
                    key={index}
                    className="text-xs bg-white/10 rounded-full px-2 py-1"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
                {nft.metadata.attributes.length > 2 && (
                  <span className="text-xs bg-white/10 rounded-full px-2 py-1">
                    +{nft.metadata.attributes.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="space-y-2">
                {auction && !isAuctionEnded ? (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShowBidModal(true)}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      disabled={isAuctionEnded}
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Place Bid
                    </Button>
                    
                    {auction.buyNowPrice && (
                      <Button 
                        onClick={handleBuyNow}
                        variant="outline"
                        className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ) : auction && isAuctionEnded ? (
                  <Button 
                    disabled
                    className="w-full bg-gray-500/20 text-gray-400 cursor-not-allowed"
                  >
                    Auction Ended
                  </Button>
                ) : nft.isForSale && nft.price ? (
                  <Button 
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy for {formatPrice(nft.price)}
                  </Button>
                ) : (
                  <Link href={`/nft/${nft.id}`} className="block">
                    <Button variant="outline" className="w-full border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white">
                      View Details
                    </Button>
                  </Link>
                )}

                {/* Buy Now Price Display */}
                {auction?.buyNowPrice && (
                  <div className="text-center">
                    <span className="text-xs text-gray-400">
                      Buy Now: <span className="text-green-400 font-medium">{formatPrice(auction.buyNowPrice)}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bid Modal */}
      {auction && (
        <BidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          auction={{
            id: auction.id,
            nft,
            currentPrice: auction.currentPrice,
            endTime: auction.endTime,
            totalBids: auction.totalBids,
            highestBidder: auction.highestBidder,
            reservePrice: auction.reservePrice,
          }}
        />
      )}
    </>
  );
}