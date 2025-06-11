'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contractService } from '@/lib/contractService';
import { toast } from 'sonner';
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
  // Contract specific fields
  contractAuctionId?: string;
  transactionHash?: string;
}

interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
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
  contractAuctions: any[];
  
  // Actions
  createAuction: (auctionData: CreateAuctionData, seller: string) => Promise<Auction>;
  getAuctionById: (id: string) => Auction | undefined;
  getActiveAuctions: () => Auction[];
  getUserAuctions: (userAddress: string) => Auction[];
  placeBid: (auctionId: string, bidder: string, amount: number) => Promise<void>;
  getBidsForAuction: (auctionId: string) => Bid[];
  updateAuctionWithNFT: (auctionId: string, nft: NFT) => void;
  setLoading: (loading: boolean) => void;
  
  // Contract integration
  syncWithContract: () => Promise<void>;
  buyNow: (auctionId: string, buyNowPrice: number) => Promise<void>;
  endAuction: (auctionId: string) => Promise<void>;
  cancelAuction: (auctionId: string) => Promise<void>;
}

export const useAuctionStore = create<AuctionStore>()(
  persist(
    (set, get) => ({
      auctions: [],
      bids: [],
      isLoading: false,
      contractAuctions: [],

      createAuction: async (auctionData, seller) => {
        set({ isLoading: true });
        
        try {
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + auctionData.duration * 24 * 60 * 60 * 1000);
          const durationInSeconds = auctionData.duration * 24 * 60 * 60;
          
          // First approve the NFT for the contract
          console.log('🔄 Approving NFT for auction...');
          const contractAddress = '0x507E13c9924adA6281e02C56bc135d224a3D8c6E'; // Passet Hub contract address
          await contractService.approveToken(auctionData.nftId, contractAddress);
          
          // Create auction on contract
          console.log('🔄 Creating auction on contract...');
          const createTx = await contractService.createAuction(
            auctionData.nftId,
            auctionData.startPrice.toString(),
            auctionData.enableBuyNow ? auctionData.buyNowPrice?.toString() || '0' : '0',
            durationInSeconds
          );
          
          // Wait for transaction confirmation
          const receipt = await createTx.wait();
          console.log('✅ Auction created on contract:', receipt.transactionHash);
          
          // Get the auction ID from contract
          const contractAuctionId = await contractService.getCurrentAuctionId();
          
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
            contractAuctionId,
            transactionHash: receipt.transactionHash,
          };
          
          set(state => ({
            auctions: [...state.auctions, newAuction],
            isLoading: false,
          }));
          
          toast.success('Auction created successfully on blockchain!');
          return newAuction;
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to create auction:', error);
          toast.error(`Failed to create auction: ${error.message}`);
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
          // Find the auction to get contract auction ID
          const auction = get().auctions.find(a => a.id === auctionId);
          if (!auction?.contractAuctionId) {
            throw new Error('Auction not found or not linked to contract');
          }
          
          console.log('🔄 Placing bid on contract...');
          const bidTx = await contractService.placeBid(
            auction.contractAuctionId,
            amount.toString()
          );
          
          // Wait for transaction confirmation
          const receipt = await bidTx.wait();
          console.log('✅ Bid placed on contract:', receipt.transactionHash);
          
          const newBid: Bid = {
            id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            auctionId,
            bidder,
            amount,
            timestamp: new Date(),
            status: 'confirmed',
            transactionHash: receipt.transactionHash,
          };
          
          set(state => ({
            bids: [...state.bids, newBid],
            auctions: state.auctions.map(a => 
              a.id === auctionId 
                ? {
                    ...a,
                    currentPrice: amount,
                    highestBidder: bidder,
                    totalBids: a.totalBids + 1,
                    updatedAt: new Date(),
                  }
                : a
            ),
            isLoading: false,
          }));
          
          toast.success('Bid placed successfully on blockchain!');
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to place bid:', error);
          toast.error(`Failed to place bid: ${error.message}`);
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

      // Contract integration methods
      syncWithContract: async () => {
        try {
          const { auctions: contractAuctions } = await contractService.getActiveAuctions(0, 50);
          set({ contractAuctions });
          
          // Sync local auctions with contract data
          const { auctions } = get();
          const updatedAuctions = auctions.map(auction => {
            if (!auction.contractAuctionId) return auction;
            
            const contractAuction = contractAuctions.find(ca => ca.auctionId === auction.contractAuctionId);
            if (contractAuction) {
              return {
                ...auction,
                currentPrice: parseFloat(contractAuction.currentBid),
                highestBidder: contractAuction.currentBidder !== '0x0000000000000000000000000000000000000000' 
                  ? contractAuction.currentBidder : undefined,
                status: contractAuction.active ? 'active' : 'ended',
                updatedAt: new Date(),
              };
            }
            return auction;
          });
          
          set({ auctions: updatedAuctions });
        } catch (error) {
          console.error('Failed to sync with contract:', error);
        }
      },

      buyNow: async (auctionId: string, buyNowPrice: number) => {
        set({ isLoading: true });
        
        try {
          const auction = get().auctions.find(a => a.id === auctionId);
          if (!auction?.contractAuctionId) {
            throw new Error('Auction not found or not linked to contract');
          }
          
          console.log('🔄 Executing buy now on contract...');
          const buyTx = await contractService.buyNow(
            auction.contractAuctionId,
            buyNowPrice.toString()
          );
          
          const receipt = await buyTx.wait();
          console.log('✅ Buy now executed on contract:', receipt.transactionHash);
          
          // Update auction status
          set(state => ({
            auctions: state.auctions.map(a => 
              a.id === auctionId 
                ? {
                    ...a,
                    status: 'ended',
                    currentPrice: buyNowPrice,
                    updatedAt: new Date(),
                  }
                : a
            ),
            isLoading: false,
          }));
          
          toast.success('Purchase completed successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to buy now:', error);
          toast.error(`Failed to complete purchase: ${error.message}`);
          throw error;
        }
      },

      endAuction: async (auctionId: string) => {
        set({ isLoading: true });
        
        try {
          const auction = get().auctions.find(a => a.id === auctionId);
          if (!auction?.contractAuctionId) {
            throw new Error('Auction not found or not linked to contract');
          }
          
          console.log('🔄 Ending auction on contract...');
          const endTx = await contractService.endAuction(auction.contractAuctionId);
          
          const receipt = await endTx.wait();
          console.log('✅ Auction ended on contract:', receipt.transactionHash);
          
          // Update auction status
          set(state => ({
            auctions: state.auctions.map(a => 
              a.id === auctionId 
                ? {
                    ...a,
                    status: 'ended',
                    updatedAt: new Date(),
                  }
                : a
            ),
            isLoading: false,
          }));
          
          toast.success('Auction ended successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to end auction:', error);
          toast.error(`Failed to end auction: ${error.message}`);
          throw error;
        }
      },

      cancelAuction: async (auctionId: string) => {
        set({ isLoading: true });
        
        try {
          const auction = get().auctions.find(a => a.id === auctionId);
          if (!auction?.contractAuctionId) {
            throw new Error('Auction not found or not linked to contract');
          }
          
          console.log('🔄 Cancelling auction on contract...');
          const cancelTx = await contractService.cancelAuction(auction.contractAuctionId);
          
          const receipt = await cancelTx.wait();
          console.log('✅ Auction cancelled on contract:', receipt.transactionHash);
          
          // Update auction status
          set(state => ({
            auctions: state.auctions.map(a => 
              a.id === auctionId 
                ? {
                    ...a,
                    status: 'cancelled',
                    updatedAt: new Date(),
                  }
                : a
            ),
            isLoading: false,
          }));
          
          toast.success('Auction cancelled successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to cancel auction:', error);
          toast.error(`Failed to cancel auction: ${error.message}`);
          throw error;
        }
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