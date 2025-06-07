'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NFT } from '@/types/nft';

interface Auction {
  id: string;
  nftId: string;
  nft?: NFT;
  seller: string;
  startPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'ended' | 'cancelled';
  highestBidder?: string;
  totalBids: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

interface CreateAuctionData {
  nftId: string;
  startPrice: number;
  duration: number;
  reservePrice?: number;
  buyNowPrice?: number;
  enableReserve: boolean;
  enableBuyNow: boolean;
}

interface AuctionStore {
  auctions: Auction[];
  bids: Bid[];
  isLoading: boolean;
  
  // Actions
  createAuction: (auctionData: CreateAuctionData, seller: string) => Promise<Auction>;
  getAuctionById: (id: string) => Auction | undefined;
  getActiveAuctions: () => Auction[];
  getUserAuctions: (userAddress: string) => Auction[];
  placeBid: (auctionId: string, bidder: string, amount: number) => Promise<void>;
  getBidsForAuction: (auctionId: string) => Bid[];
  updateAuctionWithNFT: (auctionId: string, nft: NFT) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuctionStore = create<AuctionStore>()(
  persist(
    (set, get) => ({
      auctions: [],
      bids: [],
      isLoading: false,

      createAuction: async (auctionData, seller) => {
        set({ isLoading: true });
        
        try {
          // Simulate auction creation delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + auctionData.duration * 24 * 60 * 60 * 1000);
          
          const newAuction: Auction = {
            id: `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            nftId: auctionData.nftId,
            seller,
            startPrice: auctionData.startPrice,
            currentPrice: auctionData.startPrice,
            reservePrice: auctionData.enableReserve ? auctionData.reservePrice : undefined,
            buyNowPrice: auctionData.enableBuyNow ? auctionData.buyNowPrice : undefined,
            startTime,
            endTime,
            status: 'active',
            totalBids: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set(state => ({
            auctions: [...state.auctions, newAuction],
            isLoading: false,
          }));
          
          return newAuction;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getAuctionById: (id: string) => {
        const { auctions } = get();
        return auctions.find(auction => auction.id === id);
      },

      getActiveAuctions: () => {
        const { auctions } = get();
        const now = new Date();
        return auctions.filter(auction => 
          auction.status === 'active' && auction.endTime > now
        );
      },

      getUserAuctions: (userAddress: string) => {
        const { auctions } = get();
        return auctions.filter(auction => auction.seller === userAddress);
      },

      placeBid: async (auctionId: string, bidder: string, amount: number) => {
        set({ isLoading: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newBid: Bid = {
            id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            auctionId,
            bidder,
            amount,
            timestamp: new Date(),
            status: 'confirmed',
          };
          
          set(state => ({
            bids: [...state.bids, newBid],
            auctions: state.auctions.map(auction => 
              auction.id === auctionId 
                ? {
                    ...auction,
                    currentPrice: amount,
                    highestBidder: bidder,
                    totalBids: auction.totalBids + 1,
                    updatedAt: new Date(),
                  }
                : auction
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getBidsForAuction: (auctionId: string) => {
        const { bids } = get();
        return bids
          .filter(bid => bid.auctionId === auctionId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      updateAuctionWithNFT: (auctionId: string, nft: NFT) => {
        set(state => ({
          auctions: state.auctions.map(auction =>
            auction.id === auctionId
              ? { ...auction, nft }
              : auction
          ),
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auction-store',
      partialize: (state) => ({
        auctions: state.auctions,
        bids: state.bids,
      }),
    }
  )
);