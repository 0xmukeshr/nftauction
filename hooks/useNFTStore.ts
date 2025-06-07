'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NFT } from '@/types/nft';

interface NFTStore {
  // NFT Collections
  userNFTs: NFT[];
  allNFTs: NFT[];
  
  // Actions
  addNFT: (nft: NFT) => void;
  updateNFT: (id: string, updates: Partial<NFT>) => void;
  removeNFT: (id: string) => void;
  getUserNFTs: (userAddress: string) => NFT[];
  getNFTById: (id: string) => NFT | undefined;
  
  // Minting
  mintNFT: (nftData: Omit<NFT, 'id' | 'createdAt' | 'updatedAt'>) => Promise<NFT>;
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useNFTStore = create<NFTStore>()(
  persist(
    (set, get) => ({
      userNFTs: [],
      allNFTs: [],
      isLoading: false,

      addNFT: (nft: NFT) => {
        set((state) => ({
          allNFTs: [...state.allNFTs, nft],
          userNFTs: [...state.userNFTs, nft],
        }));
      },

      updateNFT: (id: string, updates: Partial<NFT>) => {
        set((state) => ({
          allNFTs: state.allNFTs.map(nft => 
            nft.id === id ? { ...nft, ...updates, updatedAt: new Date() } : nft
          ),
          userNFTs: state.userNFTs.map(nft => 
            nft.id === id ? { ...nft, ...updates, updatedAt: new Date() } : nft
          ),
        }));
      },

      removeNFT: (id: string) => {
        set((state) => ({
          allNFTs: state.allNFTs.filter(nft => nft.id !== id),
          userNFTs: state.userNFTs.filter(nft => nft.id !== id),
        }));
      },

      getUserNFTs: (userAddress: string) => {
        const { allNFTs } = get();
        return allNFTs.filter(nft => nft.owner === userAddress || nft.creator === userAddress);
      },

      getNFTById: (id: string) => {
        const { allNFTs } = get();
        return allNFTs.find(nft => nft.id === id);
      },

      mintNFT: async (nftData) => {
        set({ isLoading: true });
        
        try {
          // Simulate minting process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const newNFT: NFT = {
            ...nftData,
            id: `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Add to store
          get().addNFT(newNFT);
          
          set({ isLoading: false });
          return newNFT;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'nft-store',
      partialize: (state) => ({
        userNFTs: state.userNFTs,
        allNFTs: state.allNFTs,
      }),
    }
  )
);