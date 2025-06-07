'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Settings, 
  Wallet, 
  Image as ImageIcon, 
  Gavel, 
  Heart, 
  TrendingUp, 
  Edit3, 
  Copy, 
  ExternalLink,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { NFTGrid } from '@/components/nft/NFTGrid';
import { useWallet } from '@/hooks/useWallet';
import { useNFTStore } from '@/hooks/useNFTStore';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

// Mock user data
const mockUserProfile = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  username: 'CosmicArtist',
  bio: 'Digital artist exploring the intersection of technology and consciousness. Creating unique NFTs that bridge the gap between reality and imagination.',
  avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg',
  banner: 'https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg',
  website: 'https://cosmicartist.io',
  twitter: '@cosmicartist',
  discord: 'CosmicArtist#1234',
  joinedDate: new Date('2023-01-15'),
  verified: true,
};

const mockActivity = [
  {
    id: '1',
    type: 'bid',
    nft: 'Cosmic Wanderer #001',
    amount: 25.5,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'confirmed',
  },
  {
    id: '2',
    type: 'mint',
    nft: 'Digital Bloom',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'confirmed',
  },
  {
    id: '3',
    type: 'sale',
    nft: 'Abstract Genesis',
    amount: 32.8,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'confirmed',
  },
];

export default function ProfilePage() {
  const { isConnected, selectedAccount } = useWallet();
  const { getUserNFTs } = useNFTStore();
  const [profile, setProfile] = useState(mockUserProfile);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<any[]>([]);
  const [activity, setActivity] = useState(mockActivity);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    // Load profile data
    const loadProfile = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedAccount) {
        const userNFTs = getUserNFTs(selectedAccount.address);
        const owned = userNFTs.filter(nft => nft.owner === selectedAccount.address);
        const created = userNFTs.filter(nft => nft.creator === selectedAccount.address);
        
        setOwnedNFTs(owned);
        setCreatedNFTs(created);
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [selectedAccount, getUserNFTs]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: number) => `${price.toFixed(2)} PAS`;

  const copyAddress = () => {
    navigator.clipboard.writeText(profile.address);
    toast.success('Address copied to clipboard');
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const filteredOwnedNFTs = ownedNFTs.filter(nft => {
    const matchesSearch = nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'for-sale') return matchesSearch && nft.isForSale;
    if (filterBy === 'not-for-sale') return matchesSearch && !nft.isForSale;
    return matchesSearch;
  });

  const isOwnProfile = isConnected && selectedAccount?.address === profile.address;

  // Calculate stats from actual NFT data
  const stats = {
    nftsOwned: ownedNFTs.length,
    nftsCreated: createdNFTs.length,
    totalVolume: ownedNFTs.reduce((sum, nft) => sum + (nft.price || 0), 0).toFixed(1),
    followers: 1247,
    following: 89,
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-6">
            <div className="h-48 bg-gradient-to-br from-white/10 to-white/5 rounded-xl shimmer" />
            <div className="h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-xl shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gradient-to-br from-white/10 to-white/5 rounded-xl shimmer" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6"
        >
          <Image
            src={profile.banner}
            alt="Profile Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {isOwnProfile && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 glass"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8 -mt-16 relative z-10"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 glass">
              <Image
                src={profile.avatar}
                alt={profile.username}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            {profile.verified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {profile.username}
                {profile.verified && (
                  <Badge variant="secondary\" className="bg-blue-500/20 text-blue-400">
                    Verified
                  </Badge>
                )}
              </h1>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="font-mono">{formatAddress(selectedAccount?.address || profile.address)}</span>
                <Button variant="ghost" size="sm" onClick={copyAddress} className="p-1">
                  <Copy className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <p className="text-gray-300 max-w-2xl">{profile.bio}</p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {profile.website && (
                <Button variant="outline\" size="sm\" className="border-white/20 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website
                </Button>
              )}
              {profile.twitter && (
                <Button variant="outline" size="sm" className="border-white/20 text-black">
                  Twitter
                </Button>
              )}
              {profile.discord && (
                <Button variant="outline" size="sm" className="border-white/20 text-black">
                  Discord
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <Link href="/mint">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create NFT
                </Button>
              </Link>
            ) :  (
              <Button variant="outline" className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white">
                <Heart className="w-4 h-4 mr-2" />
                Follow
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { label: 'NFTs Owned', value: stats.nftsOwned, icon: ImageIcon },
            { label: 'NFTs Created', value: stats.nftsCreated, icon: User },
            { label: 'Total Volume', value: `${stats.totalVolume} PAS`, icon: TrendingUp },
            { label: 'Followers', value: stats.followers, icon: Heart },
            { label: 'Following', value: stats.following, icon: User },
          ].map((stat, index) => (
            <Card key={index} className="glass border-white/20 text-center">
              <CardContent className="p-4">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-pink-400" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Edit Profile Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Username</Label>
                    <Input
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                      className="glass border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Website</Label>
                    <Input
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      className="glass border-white/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Bio</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="glass border-white/20"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-pink-500 to-purple-500">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="border-white/20">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="owned" className="space-y-6">
            <TabsList className="glass border-white/20 w-full md:w-auto">
              <TabsTrigger value="owned" className="data-[state=active]:bg-pink-500/20">
                Owned ({stats.nftsOwned})
              </TabsTrigger>
              <TabsTrigger value="created" className="data-[state=active]:bg-pink-500/20">
                Created ({stats.nftsCreated})
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-pink-500/20">
                Activity
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="settings" className="data-[state=active]:bg-pink-500/20">
                  Settings
                </TabsTrigger>
              )}
            </TabsList>

            {/* Owned NFTs */}
            <TabsContent value="owned" className="space-y-6">
              {/* Filters */}
              <div className="glass rounded-xl p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search owned NFTs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="glass border-white/20 pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'for-sale', 'not-for-sale'].map((filter) => (
                      <Button
                        key={filter}
                        variant={filterBy === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterBy(filter)}
                        className={filterBy === filter ? 'bg-pink-500' : 'border-white/20'}
                      >
                        {filter.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <NFTGrid 
                nfts={filteredOwnedNFTs} 
                emptyMessage={
                  ownedNFTs.length === 0 
                    ? "No NFTs owned yet. Start by minting your first NFT!" 
                    : "No owned NFTs found matching your search"
                }
              />

              {/* Empty State for Owned NFTs */}
              {ownedNFTs.length === 0 && isOwnProfile && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No NFTs Yet</h3>
                  <p className="text-gray-400 mb-6">Start your collection by minting your first NFT</p>
                  <Link href="/mint">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Mint Your First NFT
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Created NFTs */}
            <TabsContent value="created">
              <NFTGrid 
                nfts={createdNFTs} 
                emptyMessage={
                  createdNFTs.length === 0 
                    ? "No NFTs created yet. Start creating your first NFT!" 
                    : "No created NFTs found"
                }
              />

              {/* Empty State for Created NFTs */}
              {createdNFTs.length === 0 && isOwnProfile && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 flex items-center justify-center">
                    <Plus className="w-12 h-12 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Creations Yet</h3>
                  <p className="text-gray-400 mb-6">Express your creativity by minting your first NFT</p>
                  <Link href="/mint">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First NFT
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Activity */}
            <TabsContent value="activity">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activity.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 glass rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'bid' ? 'bg-blue-500/20' :
                            item.type === 'mint' ? 'bg-green-500/20' :
                            'bg-purple-500/20'
                          }`}>
                            {item.type === 'bid' && <Gavel className="w-5 h-5 text-blue-400" />}
                            {item.type === 'mint' && <Plus className="w-5 h-5 text-green-400" />}
                            {item.type === 'sale' && <TrendingUp className="w-5 h-5 text-purple-400" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {item.type === 'bid' && `Bid placed on ${item.nft}`}
                              {item.type === 'mint' && `Minted ${item.nft}`}
                              {item.type === 'sale' && `Sold ${item.nft}`}
                            </div>
                            <div className="text-sm text-gray-400">
                              {item.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {item.amount && (
                          <div className="text-right">
                            <div className="font-bold text-pink-400">
                              {formatPrice(item.amount)}
                            </div>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                              {item.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            {isOwnProfile && (
              <TabsContent value="settings">
                <div className="grid gap-6">
                  <Card className="glass border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-pink-400" />
                        Wallet Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">Connected Wallet</div>
                          <div className="text-sm text-gray-400">Talisman Wallet</div>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Connected
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">Address</div>
                          <div className="text-sm text-gray-400 font-mono">{formatAddress(selectedAccount?.address || profile.address)}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={copyAddress}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-pink-400" />
                        Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">Email Notifications</div>
                          <div className="text-sm text-gray-400">Receive updates about your NFTs</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">Privacy Settings</div>
                          <div className="text-sm text-gray-400">Control who can see your activity</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}