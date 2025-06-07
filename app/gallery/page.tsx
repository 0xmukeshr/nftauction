'use client';

import { useState, useEffect } from 'react';
import { NFTGrid } from '@/components/nft/NFTGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNFTStore } from '@/hooks/useNFTStore';
import { useWallet } from '@/hooks/useWallet';
import Link from 'next/link';
import type { NFT } from '@/types/nft';

export default function GalleryPage() {
  const { selectedAccount } = useWallet();
  const { allNFTs, getUserNFTs, setLoading } = useNFTStore();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoadingState] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUserNFTs, setShowUserNFTs] = useState(false);

  useEffect(() => {
    // Load NFTs
    const loadNFTs = async () => {
      setLoadingState(true);
      setLoading(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (showUserNFTs && selectedAccount) {
          const userNFTs = getUserNFTs(selectedAccount.address);
          setNfts(userNFTs);
        } else {
          setNfts(allNFTs);
        }
      } finally {
        setLoadingState(false);
        setLoading(false);
      }
    };

    loadNFTs();
  }, [allNFTs, getUserNFTs, selectedAccount, showUserNFTs, setLoading]);

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.metadata.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'for-sale') return matchesSearch && nft.isForSale;
    if (filterBy === 'not-for-sale') return matchesSearch && !nft.isForSale;
    
    return matchesSearch;
  });

const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return a.metadata.name.localeCompare(b.metadata.name);
      case 'recent':
      default:
        // Handle different date formats
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime;
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
            NFT Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our curated collection of exceptional digital art and collectibles
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8"
        >
          <div className="flex gap-3">
            <Button
              variant={!showUserNFTs ? 'default' : 'outline'}
              onClick={() => setShowUserNFTs(false)}
              className={!showUserNFTs ? 'bg-pink-500' : 'border-white/20'}
            >
              All NFTs ({allNFTs.length})
            </Button>
            {selectedAccount && (
              <Button
                variant={showUserNFTs ? 'default' : 'outline'}
                onClick={() => setShowUserNFTs(true)}
                className={showUserNFTs ? 'bg-pink-500' : 'border-white/20 text-black'}
              >
                My NFTs ({getUserNFTs(selectedAccount.address).length})
              </Button>
            )}
          </div>
          
          <Link href="/mint">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create NFT
            </Button>
          </Link>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search NFTs..."
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
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="glass border-white/20 w-40">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="all">All NFTs</SelectItem>
                  <SelectItem value="for-sale">For Sale</SelectItem>
                  <SelectItem value="not-for-sale">Not For Sale</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex glass rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="w-8 h-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-8 h-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterBy !== 'all' || sortBy !== 'recent') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              {searchTerm && (
                <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {filterBy !== 'all' && (
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  Filter: {filterBy.replace('-', ' ')}
                </span>
              )}
              {sortBy !== 'recent' && (
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                  Sort: {sortBy.replace('-', ' to ')}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                  setSortBy('recent');
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-gray-400">
            {loading ? 'Loading...' : `Showing ${sortedNFTs.length} NFT${sortedNFTs.length !== 1 ? 's' : ''}`}
            {showUserNFTs && selectedAccount && ' from your collection'}
          </p>
        </motion.div>

        {/* NFT Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <NFTGrid 
            nfts={sortedNFTs} 
            loading={loading}
            emptyMessage={
              showUserNFTs 
                ? "You haven't minted any NFTs yet. Create your first NFT!" 
                : searchTerm 
                  ? `No NFTs found matching "${searchTerm}"` 
                  : "No NFTs found"
            }
          />
        </motion.div>

        {/* Load More Button */}
        {!loading && sortedNFTs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button variant="outline" className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white">
              Load More NFTs
            </Button>
          </motion.div>
        )}

        {/* Empty State for New Users */}
        {!loading && sortedNFTs.length === 0 && showUserNFTs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 flex items-center justify-center">
              <Plus className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Create Your First NFT</h3>
            <p className="text-gray-400 mb-6">Start your NFT journey by minting your first digital collectible</p>
            <Link href="/mint">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Mint Your First NFT
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}