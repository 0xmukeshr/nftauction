'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Gavel, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuctionStore } from '@/hooks/useAuctionStore';
import { toast } from 'sonner';
import Image from 'next/image';
import type { NFT } from '@/types/nft';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: {
    id: string;
    nft: NFT;
    currentPrice: number;
    endTime: Date;
    totalBids: number;
    highestBidder?: string;
    reservePrice?: number;
  };
}

export function BidModal({ isOpen, onClose, auction }: BidModalProps) {
  const { isConnected, selectedAccount, balance } = useWallet();
  const { placeBid, isLoading } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minBidAmount = auction.currentPrice + 0.1; // Minimum increment
  const userBalance = parseFloat(balance.replace(/,/g, '')) || 0;
  const bidValue = parseFloat(bidAmount) || 0;

  const formatPrice = (price: number) => `${price.toFixed(2)} PAS`;
  
  const formatTimeLeft = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isValidBid = () => {
    if (!bidAmount || bidValue <= 0) return false;
    if (bidValue < minBidAmount) return false;
    if (bidValue > userBalance) return false;
    return true;
  };

  const handlePlaceBid = async () => {
    if (!isConnected || !selectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isValidBid()) {
      toast.error('Invalid bid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      await placeBid(auction.id, selectedAccount.address, bidValue);
      
      toast.success(`Bid of ${formatPrice(bidValue)} placed successfully!`);
      setBidAmount('');
      onClose();
      
    } catch (error) {
      toast.error('Failed to place bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = (amount: number) => {
    setBidAmount(amount.toFixed(2));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass rounded-2xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Gavel className="w-5 h-5 mr-2 text-pink-400" />
              Place Bid
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* NFT Preview */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={auction.nft.metadata.image}
                  alt={auction.nft.metadata.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{auction.nft.metadata.name}</h3>
                <p className="text-sm text-gray-400">
                  By {auction.nft.creator.slice(0, 8)}...
                </p>
              </div>
            </div>

            {/* Auction Info */}
            <div className="glass rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current Bid</span>
                <span className="font-bold text-pink-400">{formatPrice(auction.currentPrice)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Time Left</span>
                <span className="font-medium text-white flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTimeLeft(auction.endTime)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Bids</span>
                <span className="font-medium text-white">{auction.totalBids}</span>
              </div>

              {auction.reservePrice && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Reserve Price</span>
                  <span className={`font-medium ${
                    auction.currentPrice >= auction.reservePrice ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {formatPrice(auction.reservePrice)}
                    {auction.currentPrice >= auction.reservePrice && ' ✓'}
                  </span>
                </div>
              )}
            </div>

            {/* Bid Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Your Bid Amount (PAS)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={`Min: ${formatPrice(minBidAmount)}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="glass border-white/20 focus:border-pink-400 text-lg font-semibold"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    Minimum: {formatPrice(minBidAmount)}
                  </span>
                  <span className="text-gray-400">
                    Balance: {formatPrice(userBalance)}
                  </span>
                </div>
              </div>

              {/* Quick Bid Buttons */}
              <div className="space-y-2">
                <Label className="text-white text-sm">Quick Bid</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    minBidAmount,
                    minBidAmount + 1,
                    minBidAmount + 5,
                  ].map((amount, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickBid(amount)}
                      className="border-pink-400/50 text-pink-400 hover:bg-pink-400/20"
                      disabled={amount > userBalance}
                    >
                      {formatPrice(amount)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Messages */}
            {bidAmount && (
              <div className="space-y-2">
                {bidValue < minBidAmount && (
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Bid must be at least {formatPrice(minBidAmount)}</span>
                  </div>
                )}
                
                {bidValue > userBalance && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Insufficient balance</span>
                  </div>
                )}
                
                {isValidBid() && (
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Valid bid amount</span>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Connection Warning */}
            {!isConnected && (
              <div className="glass rounded-lg p-4 border border-yellow-500/50">
                <p className="text-yellow-400 text-sm text-center">
                  Please connect your wallet to place bids
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlaceBid}
                disabled={!isConnected || !isValidBid() || isSubmitting || isLoading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2" />
                    Placing Bid...
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4 mr-2" />
                    Place Bid
                  </>
                )}
              </Button>
            </div>

            {/* Fee Information */}
            <div className="text-xs text-gray-400 text-center">
              <p>Network fee: ~0.01 PAS • Platform fee: 2.5%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}