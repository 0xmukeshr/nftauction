'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Gavel, Heart, Share2, ExternalLink, TrendingUp, Users, Eye } from 'lucide-react';
import { BidModal } from '@/components/auction/BidModal';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

// Mock auction data
const mockAuction = {
  id: '1',
  nft: {
    id: '1',
    collectionId: 1,
    itemId: 1,
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    creator: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    metadata: {
      name: 'Cosmic Wanderer #001',
      description: 'A digital artwork depicting a cosmic explorer traversing the multiverse. This piece represents the eternal journey of consciousness through infinite dimensions, rendered in stunning detail with vibrant cosmic colors and ethereal lighting effects.',
      image: 'https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg',
      attributes: [
        { trait_type: 'Rarity', value: 'Legendary' },
        { trait_type: 'Element', value: 'Cosmic' },
        { trait_type: 'Power Level', value: '9500' },
        { trait_type: 'Background', value: 'Nebula' },
        { trait_type: 'Eyes', value: 'Starlight' },
        { trait_type: 'Aura', value: 'Celestial' },
      ],
    },
    price: 25.5,
    isForSale: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  seller: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  startPrice: 20.0,
  currentPrice: 25.5,
  reservePrice: 30.0,
  buyNowPrice: 50.0,
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  status: 'active' as const,
  highestBidder: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  totalBids: 12,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBidHistory = [
  {
    id: '1',
    bidder: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    amount: 25.5,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: 'confirmed' as const,
  },
  {
    id: '2',
    bidder: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    amount: 24.8,
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    status: 'confirmed' as const,
  },
  {
    id: '3',
    bidder: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    amount: 23.2,
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'confirmed' as const,
  },
];

export default function AuctionDetailPage() {
  const params = useParams();
  const { isConnected, selectedAccount } = useWallet();
  const [auction, setAuction] = useState(mockAuction);
  const [bidHistory, setBidHistory] = useState(mockBidHistory);
  const [showBidModal, setShowBidModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading auction data
    const loadAuction = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };

    loadAuction();
  }, [params.id]);

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isAuctionEnding = (auction.endTime.getTime() - Date.now()) < 3600000;
  const isAuctionEnded = auction.endTime.getTime() <= Date.now();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Auction link copied to clipboard');
  };

  const handleBuyNow = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    // Implement buy now functionality
    toast.success('Buy now functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-xl shimmer" />
            <div className="space-y-6">
              <div className="h-8 bg-gradient-to-r from-white/10 to-white/5 rounded shimmer" />
              <div className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-2/3 shimmer" />
              <div className="h-32 bg-gradient-to-r from-white/10 to-white/5 rounded shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/auctions" className="inline-flex items-center text-pink-400 hover:text-pink-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* NFT Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-xl overflow-hidden glass border-white/20">
              <Image
                src={auction.nft.metadata.image}
                alt={auction.nft.metadata.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </motion.div>

          {/* Auction Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{auction.nft.metadata.name}</h1>
              <p className="text-gray-400">
                Created by <span className="text-pink-400">{formatAddress(auction.nft.creator)}</span>
              </p>
            </div>

            {/* Auction Status */}
            <Card className={`glass border-white/20 ${isAuctionEnding ? 'border-red-500/50' : ''}`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-pink-400" />
                    {isAuctionEnded ? 'Auction Ended' : 'Auction Ends In'}
                  </span>
                  {auction.status === 'active' && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Live
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuctionEnded && (
                  <div className="text-2xl font-bold text-white">
                    {formatTimeLeft(auction.endTime)}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Current Bid</div>
                    <div className="text-xl font-bold text-pink-400">
                      {formatPrice(auction.currentPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Bids</div>
                    <div className="text-xl font-bold text-white">{auction.totalBids}</div>
                  </div>
                </div>

                {auction.reservePrice && (
                  <div className="flex justify-between items-center p-3 glass rounded-lg">
                    <span className="text-gray-400">Reserve Price</span>
                    <span className={`font-semibold ${
                      auction.currentPrice >= auction.reservePrice ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {formatPrice(auction.reservePrice)}
                      {auction.currentPrice >= auction.reservePrice && ' ✓ Met'}
                    </span>
                  </div>
                )}

                {auction.buyNowPrice && (
                  <div className="flex justify-between items-center p-3 glass rounded-lg border border-green-500/50">
                    <span className="text-gray-400">Buy Now Price</span>
                    <span className="font-semibold text-green-400">
                      {formatPrice(auction.buyNowPrice)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bidding Actions */}
            <div className="space-y-3">
              {!isAuctionEnded ? (
                <>
                  <Button
                    onClick={() => setShowBidModal(true)}
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-3"
                  >
                    <Gavel className="w-5 h-5 mr-2" />
                    Place Bid
                  </Button>
                  
                  {auction.buyNowPrice && (
                    <Button
                      onClick={handleBuyNow}
                      disabled={!isConnected}
                      variant="outline"
                      className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-white py-3"
                    >
                      Buy Now for {formatPrice(auction.buyNowPrice)}
                    </Button>
                  )}
                </>
              ) : (
                <Button disabled className="w-full bg-gray-500/20 text-gray-400 py-3">
                  Auction Ended
                </Button>
              )}

              {!isConnected && (
                <div className="glass rounded-lg p-4 text-center border border-yellow-500/50">
                  <p className="text-yellow-400 text-sm">Connect your wallet to participate</p>
                </div>
              )}
            </div>

            {/* Description */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {auction.nft.metadata.description}
                </p>
              </CardContent>
            </Card>

            {/* Attributes */}
            {auction.nft.metadata.attributes && auction.nft.metadata.attributes.length > 0 && (
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {auction.nft.metadata.attributes.map((attr, index) => (
                      <div key={index} className="glass rounded-lg p-3">
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          {attr.trait_type}
                        </div>
                        <div className="font-semibold text-white">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bid History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-pink-400" />
                Bid History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bidHistory.map((bid, index) => (
                  <div key={bid.id} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {formatPrice(bid.amount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          by {formatAddress(bid.bidder)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {bid.timestamp.toLocaleTimeString()}
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        auction={{
          id: auction.id,
          nft: auction.nft,
          currentPrice: auction.currentPrice,
          endTime: auction.endTime,
          totalBids: auction.totalBids,
          highestBidder: auction.highestBidder,
          reservePrice: auction.reservePrice,
        }}
      />
    </div>
  );
}