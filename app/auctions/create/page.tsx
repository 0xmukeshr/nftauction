'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Gavel, Clock, DollarSign, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useNFTStore } from '@/hooks/useNFTStore';
import { useAuctionStore } from '@/hooks/useAuctionStore';
import { contractService } from '@/lib/contractService';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CreateAuctionPage() {
  const router = useRouter();
  const { isConnected, selectedAccount } = useWallet();
  const { getUserNFTs, updateNFT } = useNFTStore();
  const { createAuction, isLoading } = useAuctionStore();
  const [selectedNFT, setSelectedNFT] = useState<string>('');
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  
  const [auctionData, setAuctionData] = useState({
    startPrice: '',
    reservePrice: '',
    buyNowPrice: '',
    duration: '7',
    enableReserve: false,
    enableBuyNow: false,
  });

  useEffect(() => {
    if (selectedAccount) {
      const nfts = getUserNFTs(selectedAccount.address);
      // Only show NFTs that are not currently for sale and owned by the user
      const availableNFTs = nfts.filter(nft => 
        !nft.isForSale && nft.owner === selectedAccount.address
      );
      setUserNFTs(availableNFTs);
    }
  }, [selectedAccount, getUserNFTs]);

  const handleCreateAuction = async () => {
    if (!isConnected || !selectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedNFT || !auctionData.startPrice || !auctionData.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validation
    const startPrice = parseFloat(auctionData.startPrice);
    const reservePrice = auctionData.enableReserve ? parseFloat(auctionData.reservePrice) : 0;
    const buyNowPrice = auctionData.enableBuyNow ? parseFloat(auctionData.buyNowPrice) : 0;

    if (auctionData.enableReserve && reservePrice <= startPrice) {
      toast.error('Reserve price must be higher than starting price');
      return;
    }

    if (auctionData.enableBuyNow && buyNowPrice <= startPrice) {
      toast.error('Buy now price must be higher than starting price');
      return;
    }

    if (auctionData.enableReserve && auctionData.enableBuyNow && buyNowPrice <= reservePrice) {
      toast.error('Buy now price must be higher than reserve price');
      return;
    }

    try {
      // Create the auction
      const auction = await createAuction({
        nftId: selectedNFT,
        startPrice,
        duration: parseInt(auctionData.duration),
        reservePrice: auctionData.enableReserve ? reservePrice : undefined,
        buyNowPrice: auctionData.enableBuyNow ? buyNowPrice : undefined,
        enableReserve: auctionData.enableReserve,
        enableBuyNow: auctionData.enableBuyNow,
      }, selectedAccount.address);

      // Update the NFT to mark it as for sale
      updateNFT(selectedNFT, {
        isForSale: true,
        price: startPrice,
      });

      toast.success('Auction created successfully!');
      
      // Redirect to auctions page
      router.push('/auctions');
      
    } catch (error) {
      toast.error('Failed to create auction. Please try again.');
    }
  };

  const selectedNFTData = userNFTs.find(nft => nft.id === selectedNFT);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Link href="/auctions" className="inline-flex items-center text-pink-400 hover:text-pink-300 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Create <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">Auction</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            List your NFT for auction and let collectors bid for it
          </p>
        </motion.div>

        {/* No NFTs Warning */}
        {isConnected && userNFTs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 mb-8 border border-yellow-500/50"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-yellow-400 font-semibold">No NFTs Available for Auction</h3>
                <p className="text-gray-300 text-sm">
                  You need to mint NFTs first or you have no NFTs available for auction. 
                  NFTs currently listed for sale cannot be auctioned.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href="/mint">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  Mint New NFT
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  View Gallery
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Select NFT */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Gavel className="w-5 h-5 mr-2 text-pink-400" />
                  Select NFT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Choose NFT to auction *</Label>
                  <Select value={selectedNFT} onValueChange={setSelectedNFT}>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder={
                        userNFTs.length === 0 
                          ? "No NFTs available for auction" 
                          : "Select an NFT from your collection"
                      } />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/20">
                      {userNFTs.map((nft) => (
                        <SelectItem key={nft.id} value={nft.id}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-r from-pink-500/20 to-blue-500/20 overflow-hidden">
                              <Image
                                src={nft.metadata.image}
                                alt={nft.metadata.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{nft.metadata.name}</div>
                              <div className="text-xs text-gray-400">ID: {nft.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {userNFTs.length === 0 && (
                    <p className="text-xs text-gray-400">
                      Mint NFTs or remove existing listings to create auctions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-pink-400" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Starting Price (PAS) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={auctionData.startPrice}
                    onChange={(e) => setAuctionData({...auctionData, startPrice: e.target.value})}
                    className="glass border-white/20 focus:border-pink-400"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={auctionData.enableReserve}
                    onCheckedChange={(checked) => setAuctionData({...auctionData, enableReserve: checked})}
                  />
                  <Label className="text-white">Set Reserve Price</Label>
                </div>

                {auctionData.enableReserve && (
                  <div className="space-y-2">
                    <Label className="text-white">Reserve Price (PAS)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={auctionData.reservePrice}
                      onChange={(e) => setAuctionData({...auctionData, reservePrice: e.target.value})}
                      className="glass border-white/20 focus:border-pink-400"
                    />
                    <p className="text-xs text-gray-400">Minimum price for the auction to be successful</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={auctionData.enableBuyNow}
                    onCheckedChange={(checked) => setAuctionData({...auctionData, enableBuyNow: checked})}
                  />
                  <Label className="text-white">Enable Buy Now</Label>
                </div>

                {auctionData.enableBuyNow && (
                  <div className="space-y-2">
                    <Label className="text-white">Buy Now Price (PAS)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={auctionData.buyNowPrice}
                      onChange={(e) => setAuctionData({...auctionData, buyNowPrice: e.target.value})}
                      className="glass border-white/20 focus:border-pink-400"
                    />
                    <p className="text-xs text-gray-400">Allow instant purchase at this price</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Duration */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-pink-400" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Auction Duration *</Label>
                  <Select value={auctionData.duration} onValueChange={(value) => setAuctionData({...auctionData, duration: value})}>
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/20">
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fees Info */}
            <Card className="glass border-white/20 border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Fees & Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-white">2.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Creator Royalty</span>
                  <span className="text-white">5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network Fee</span>
                  <span className="text-white">~0.01 PAS</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-400">
                    Fees are deducted from the final sale price. You'll receive the remaining amount after a successful auction.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedNFTData ? (
                  <div className="space-y-4">
                    <div className="aspect-square rounded-xl overflow-hidden">
                      <Image
                        src={selectedNFTData.metadata.image}
                        alt={selectedNFTData.metadata.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedNFTData.metadata.name}</h3>
                      <p className="text-gray-400">ID: {selectedNFTData.id}</p>
                      <p className="text-gray-400">Owner: {selectedNFTData.owner.slice(0, 8)}...</p>
                    </div>

                    {selectedNFTData.metadata.description && (
                      <div className="glass rounded-lg p-3">
                        <p className="text-sm text-gray-300">{selectedNFTData.metadata.description}</p>
                      </div>
                    )}

                    {auctionData.startPrice && (
                      <div className="glass rounded-lg p-4">
                        <div className="text-sm text-gray-400">Starting Price</div>
                        <div className="text-xl font-bold text-pink-400">{auctionData.startPrice} PAS</div>
                      </div>
                    )}

                    {auctionData.enableReserve && auctionData.reservePrice && (
                      <div className="glass rounded-lg p-4">
                        <div className="text-sm text-gray-400">Reserve Price</div>
                        <div className="text-lg font-semibold text-blue-400">{auctionData.reservePrice} PAS</div>
                      </div>
                    )}

                    {auctionData.enableBuyNow && auctionData.buyNowPrice && (
                      <div className="glass rounded-lg p-4">
                        <div className="text-sm text-gray-400">Buy Now Price</div>
                        <div className="text-lg font-semibold text-green-400">{auctionData.buyNowPrice} PAS</div>
                      </div>
                    )}

                    <div className="glass rounded-lg p-4">
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="text-lg font-semibold text-white">{auctionData.duration} Day{auctionData.duration !== '1' ? 's' : ''}</div>
                    </div>

                    {/* Attributes */}
                    {selectedNFTData.metadata.attributes && selectedNFTData.metadata.attributes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Attributes</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedNFTData.metadata.attributes.map((attr: any, index: number) => (
                            <div key={index} className="glass rounded-lg p-2">
                              <div className="text-xs text-gray-400">{attr.trait_type}</div>
                              <div className="text-xs font-medium text-white">{attr.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <div className="text-center">
                      <Gavel className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">Select an NFT to preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button
              onClick={handleCreateAuction}
              disabled={isLoading || !isConnected || !selectedNFT || !auctionData.startPrice || userNFTs.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 py-3"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2" />
                  Creating Auction...
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4 mr-2" />
                  Create Auction
                </>
              )}
            </Button>

            {!isConnected && (
              <div className="glass rounded-xl p-4 text-center border border-yellow-500/50">
                <p className="text-yellow-400 text-sm">Please connect your wallet to create auctions</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}