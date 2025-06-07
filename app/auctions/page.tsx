'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Clock, Zap, TrendingUp, Gavel, Plus } from 'lucide-react';
import { NFTCard } from '@/components/nft/NFTCard';
import { useAuctionStore } from '@/hooks/useAuctionStore';
import { useNFTStore } from '@/hooks/useNFTStore';
import Link from 'next/link';

export default function AuctionsPage() {
  const { getActiveAuctions, updateAuctionWithNFT } = useAuctionStore();
  const { getNFTById } = useNFTStore();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [filterBy, setFilterBy] = useState('all');
  const [stats, setStats] = useState({
    totalVolume: '1.2M',
    activeAuctions: 0,
    totalBids: 0,
    avgPrice: '24.5',
  });

  useEffect(() => {
    // Load auctions
    const fetchAuctions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const activeAuctions = getActiveAuctions();
      
      // Populate auctions with NFT data
      const auctionsWithNFTs = activeAuctions.map(auction => {
        const nft = getNFTById(auction.nftId);
        if (nft) {
          // Update the auction store with NFT data
          updateAuctionWithNFT(auction.id, nft);
          return {
            ...auction,
            nft,
          };
        }
        return null;
      }).filter(Boolean); // Remove null entries
      
      setAuctions(auctionsWithNFTs);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeAuctions: auctionsWithNFTs.length,
        totalBids: auctionsWithNFTs.reduce((sum, auction) => sum + auction.totalBids, 0),
      }));
      
      setLoading(false);
    };

    fetchAuctions();
  }, [getActiveAuctions, getNFTById, updateAuctionWithNFT]);

  const filteredAuctions = auctions.filter(auction => {
    if (!auction?.nft?.metadata) return false;
    
    const matchesSearch = auction.nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'ending-soon') {
      const timeLeft = auction.endTime.getTime() - Date.now();
      return matchesSearch && timeLeft < 3600000; // Less than 1 hour
    }
    if (filterBy === 'high-value') return matchesSearch && auction.currentPrice > 20;
    
    return matchesSearch;
  });

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case 'ending-soon':
        return a.endTime.getTime() - b.endTime.getTime();
      case 'price-high':
        return b.currentPrice - a.currentPrice;
      case 'price-low':
        return a.currentPrice - b.currentPrice;
      case 'most-bids':
        return b.totalBids - a.totalBids;
      default:
        return a.endTime.getTime() - b.endTime.getTime();
    }
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Live <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">Auctions</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Bid on exclusive NFTs and discover rare digital collectibles
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Volume', value: stats.totalVolume + ' PAS', icon: TrendingUp },
            { label: 'Active Auctions', value: stats.activeAuctions.toString(), icon: Gavel },
            { label: 'Total Bids', value: stats.totalBids.toString(), icon: Zap },
            { label: 'Avg Price', value: stats.avgPrice + ' PAS', icon: Clock },
          ].map((stat, index) => (
            <Card key={index} className="glass border-white/20 text-center">
              <CardContent className="p-4">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Create Auction Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-end mb-6"
        >
          <Link href="/auctions/create">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Auction
            </Button>
          </Link>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass border-white/20 pl-10 focus:border-pink-400 focus:ring-pink-400/20"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="glass border-white/20 w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="price-high">Highest Price</SelectItem>
                  <SelectItem value="price-low">Lowest Price</SelectItem>
                  <SelectItem value="most-bids">Most Bids</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="glass border-white/20 w-40">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="all">All Auctions</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="high-value">High Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterBy !== 'all' || sortBy !== 'ending-soon') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              {searchTerm && (
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {filterBy !== 'all' && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  Filter: {filterBy.replace('-', ' ')}
                </Badge>
              )}
              {sortBy !== 'ending-soon' && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  Sort: {sortBy.replace('-', ' ')}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                  setSortBy('ending-soon');
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear all
              </Button>
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-6"
        >
          <p className="text-gray-400">
            {loading ? 'Loading...' : `${sortedAuctions.length} active auction${sortedAuctions.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>

        {/* Auction Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {loading ? (
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
          ) : sortedAuctions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 flex items-center justify-center">
                <Gavel className="w-12 h-12 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Auctions Found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm ? `No auctions found matching "${searchTerm}"` : "No active auctions at the moment"}
              </p>
              <Link href="/auctions/create">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  Create First Auction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAuctions.map((auction, index) => (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <NFTCard 
                    nft={auction.nft} 
                    auction={{
                      id: auction.id,
                      currentPrice: auction.currentPrice,
                      endTime: auction.endTime,
                      totalBids: auction.totalBids,
                      highestBidder: auction.highestBidder,
                      reservePrice: auction.reservePrice,
                      buyNowPrice: auction.buyNowPrice,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Load More */}
        {!loading && sortedAuctions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button variant="outline" className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white">
              Load More Auctions
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}