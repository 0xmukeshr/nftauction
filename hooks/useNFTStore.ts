'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { contractService } from '@/lib/contractService';
import { toast } from 'sonner';
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
  
  // Contract functions
  getTokenOwner: (tokenId: string) => Promise<string>;
  getTokenURI: (tokenId: string) => Promise<string>;
  approveToken: (tokenId: string, spender: string) => Promise<any>;
  getCurrentTokenId: () => Promise<string>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNFTStore = create<NFTStore>()(
  persist(
    (set, get) => ({
      userNFTs: [],
      allNFTs: [],
      isLoading: false,
      error: null,

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
        set({ isLoading: true, error: null });

        try {
          console.log('🔄 Starting NFT minting process...');
          // Create metadata JSON (in production, this would be uploaded to IPFS)
          const metadata = {
            name: nftData.metadata.name,
            description: nftData.metadata.description,
            image: nftData.metadata.image,
            attributes: nftData.metadata.attributes || [],
          };

          // For demo purposes, create a mock IPFS URI
          const tokenURI = `https://ipfs.io/ipfs/mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          console.log('🔄 Minting NFT on contract...');
          const mintResult = await contractService.mintNFT(nftData.owner, tokenURI);
          console.log('✅ NFT minted successfully:', {
            tokenId: mintResult.tokenId,
            transactionHash: mintResult.transactionHash
          });

          const newNFT: NFT = {
            ...nftData,
            id: mintResult.tokenId, // Use the actual token ID from contract
            metadata: {
              ...metadata,
              tokenURI,
            },
            contractTokenId: mintResult.tokenId,
            transactionHash: mintResult.transactionHash,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          get().addNFT(newNFT);
          
          set({ isLoading: false });
          toast.success(`NFT minted successfully! Token ID: ${mintResult.tokenId}`);
          
          return newNFT;
        } catch (error: any) {
          console.error('Failed to mint NFT:', error);
          const errorMessage = error.message || 'Failed to mint NFT';
          set({ isLoading: false, error: errorMessage });
          toast.error(`Minting failed: ${errorMessage}`);
          throw error;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Contract integration methods
      getTokenOwner: async (tokenId: string) => {
        try {
          return await contractService.getTokenOwner(tokenId);
        } catch (error: any) {
          console.error('Failed to get token owner:', error);
          toast.error('Failed to get token owner');
          throw error;
        }
      },

      getTokenURI: async (tokenId: string) => {
        try {
          return await contractService.getTokenURI(tokenId);
        } catch (error: any) {
          console.error('Failed to get token URI:', error);
          toast.error('Failed to get token URI');
          throw error;
        }
      },

      approveToken: async (tokenId: string, spender: string) => {
        try {
          console.log(`🔄 Approving token ${tokenId} for ${spender}...`);
          const result = await contractService.approveToken(tokenId, spender);
          const receipt = await result.wait();
          console.log('✅ Token approved:', receipt.transactionHash);
          toast.success('Token approved successfully!');
          return receipt;
        } catch (error: any) {
          console.error('Failed to approve token:', error);
          toast.error(`Failed to approve token: ${error.message}`);
          throw error;
        }
      },

      getCurrentTokenId: async () => {
        try {
          return await contractService.getCurrentTokenId();
        } catch (error: any) {
          console.error('Failed to get current token ID:', error);
          throw error;
        }
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