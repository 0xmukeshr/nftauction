'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Share2, ExternalLink, User, Calendar, Tag, Gavel } from 'lucide-react';
import { useNFTStore } from '@/hooks/useNFTStore';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedAccount } = useWallet();
  const { getNFTById } = useNFTStore();
  const [nft, setNft] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNFT = async () => {
      setLoading(true);
      
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const nftId = Array.isArray(params.id) ? params.id[0] : params.id;
        
        if (!nftId) {
          toast.error('Invalid NFT ID');
          router.push('/gallery');
          return;
        }
        
        const foundNFT = getNFTById(nftId);
        if (foundNFT) {
          setNft(foundNFT);
        } else {
          // NFT not found, redirect to gallery
          toast.error('NFT not found');
          router.push('/gallery');
          return;
        }
      } catch (error) {
        console.error('Error loading NFT:', error);
        toast.error('Failed to load NFT');
        router.push('/gallery');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadNFT();
    }
  }, [params.id, getNFTById, router]);

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: number) => `${price.toFixed(2)} PAS`;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('NFT link copied to clipboard');
    }
  };

  const isOwner = selectedAccount && nft && selectedAccount.address === nft.owner;
  const isCreator = selectedAccount && nft && selectedAccount.address === nft.creator;

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

  if (!nft) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">NFT Not Found</h3>
            <p className="text-gray-400 mb-6">The NFT you're looking for doesn't exist or has been removed.</p>
            <Link href="/gallery">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                Back to Gallery
              </Button>
            </Link>
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
          <Link href="/gallery" className="inline-flex items-center text-pink-400 hover:text-pink-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
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
                src={nft.metadata.image}
                alt={nft.metadata.name}
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

          {/* NFT Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{nft.metadata.name}</h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Created by</span>
                  <span className="text-pink-400">{formatAddress(nft.creator)}</span>
                </div>
                {nft.owner !== nft.creator && (
                  <div className="flex items-center space-x-1">
                    <span>Owned by</span>
                    <span className="text-blue-400">{formatAddress(nft.owner)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price/Status */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-pink-400" />
                    {nft.isForSale ? 'For Sale' : 'Not Listed'}
                  </span>
                  {nft.isForSale && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Available
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nft.isForSale && nft.price ? (
                  <div className="text-2xl font-bold text-pink-400 mb-4">
                    {formatPrice(nft.price)}
                  </div>
                ) : (
                  <div className="text-lg text-gray-400 mb-4">
                    Not currently for sale
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {nft.isForSale && nft.price && !isOwner && (
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      Buy Now for {formatPrice(nft.price)}
                    </Button>
                  )}
                  
                  {!nft.isForSale && !isOwner && (
                    <Button disabled className="w-full bg-gray-500/20 text-gray-400">
                      Not Available for Purchase
                    </Button>
                  )}

                  {isOwner && (
                    <div className="space-y-2">
                      <Link href="/auctions/create" className="block">
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                          <Gavel className="w-4 h-4 mr-2" />
                          Create Auction
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        {nft.isForSale ? 'Update Listing' : 'List for Sale'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {nft.metadata.description}
                </p>
              </CardContent>
            </Card>

            {/* Attributes */}
            {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {nft.metadata.attributes.map((attr: any, index: number) => (
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

            {/* NFT Details */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">NFT ID</span>
                  <span className="text-white font-mono">{nft.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Collection ID</span>
                  <span className="text-white">{nft.collectionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Item ID</span>
                  <span className="text-white">{nft.itemId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">{nft.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blockchain</span>
                  <span className="text-white">Polkadot Asset Hub</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}