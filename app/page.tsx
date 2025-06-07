'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NFTGrid } from '@/components/nft/NFTGrid';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import { useNFTStore } from '@/hooks/useNFTStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { allNFTs } = useNFTStore();
  const [featuredNFTs, setFeaturedNFTs] = useState<any[]>([]);

  useEffect(() => {
    // Show the latest 4 NFTs as featured, or use mock data if none exist
    if (allNFTs.length > 0) {
      const latest = allNFTs.slice(-4).reverse();
      setFeaturedNFTs(latest);
    } else {
      // Mock data for demonstration when no NFTs exist
      setFeaturedNFTs([
        {
          id: 'demo-1',
          collectionId: 1,
          itemId: 1,
          owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          creator: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          metadata: {
            name: 'Cosmic Wanderer #001',
            description: 'A digital artwork depicting a cosmic explorer traversing the multiverse.',
            image: 'https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg',
            attributes: [
              { trait_type: 'Rarity', value: 'Legendary' },
              { trait_type: 'Element', value: 'Cosmic' },
            ],
          },
          price: 25.5,
          isForSale: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'demo-2',
          collectionId: 1,
          itemId: 2,
          owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          creator: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          metadata: {
            name: 'Neon Dreams #042',
            description: 'Vibrant neon cityscape from a cyberpunk future.',
            image: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg',
            attributes: [
              { trait_type: 'Style', value: 'Cyberpunk' },
              { trait_type: 'Mood', value: 'Electric' },
            ],
          },
          price: 18.2,
          isForSale: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'demo-3',
          collectionId: 2,
          itemId: 1,
          owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          creator: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          metadata: {
            name: 'Abstract Genesis',
            description: 'The beginning of abstract consciousness in digital form.',
            image: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
            attributes: [
              { trait_type: 'Style', value: 'Abstract' },
              { trait_type: 'Complexity', value: 'High' },
            ],
          },
          price: 32.8,
          isForSale: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'demo-4',
          collectionId: 2,
          itemId: 2,
          owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          creator: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          metadata: {
            name: 'Digital Bloom',
            description: 'Nature meets technology in this stunning floral composition.',
            image: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg',
            attributes: [
              { trait_type: 'Theme', value: 'Nature' },
              { trait_type: 'Color', value: 'Vibrant' },
            ],
          },
          price: 15.7,
          isForSale: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  }, [allNFTs]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Discover Rare
                </span>
                <br />
                <span className="text-white">Digital Collectibles</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                The premier NFT marketplace on Polkadot Asset Hub. Create, collect, and trade 
                extraordinary digital assets with seamless blockchain integration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/gallery">
                  <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3 text-lg">
                    Explore Gallery
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                
                <Link href="/mint">
                  <Button size="lg" variant="outline" className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white px-8 py-3 text-lg">
                    Create NFT
                    <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl float" />
        <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl float" style={{ animationDelay: '2s' }} />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-black/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose PolkaNFT?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built on Polkadot's cutting-edge technology for the future of digital ownership
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure & Decentralized',
                description: 'Built on Polkadot Asset Hub with enterprise-grade security and true decentralization.',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Experience near-instant transactions with minimal fees on Polkadot\'s efficient infrastructure.',
              },
              {
                icon: TrendingUp,
                title: 'Growing Ecosystem',
                description: 'Join a thriving community of creators and collectors in the expanding Polkadot ecosystem.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass-hover rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-blue-500/20 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured NFTs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {allNFTs.length > 0 ? 'Latest Creations' : 'Featured Collections'}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {allNFTs.length > 0 
                ? 'Discover the newest digital art from our community of creators'
                : 'Discover exceptional digital art from talented creators worldwide'
              }
            </p>
          </motion.div>

          <NFTGrid nfts={featuredNFTs} />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white">
                View All NFTs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Total Volume', value: '2.4M PAS' },
              { label: 'NFTs Created', value: allNFTs.length.toString() },
              { label: 'Active Users', value: '8.9K' },
              { label: 'Collections', value: '1.2K' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}