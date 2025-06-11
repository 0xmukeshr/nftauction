'use client';

import { useEffect, useState } from 'react';
import { useWallet } from './useWallet';
import { contractService } from '@/lib/contractService';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface ContractState {
  isContractConnected: boolean;
  isInitializing: boolean;
  contractError: string | null;
  currentTokenId: string | null;
  currentAuctionId: string | null;
  marketplaceFee: number | null;
}

export function useContractIntegration() {
  const { isConnected, selectedAccount } = useWallet();
  const [state, setState] = useState<ContractState>({
    isContractConnected: false,
    isInitializing: false,
    contractError: null,
    currentTokenId: null,
    currentAuctionId: null,
    marketplaceFee: null,
  });

  const initializeContract = async () => {
    if (!isConnected) return;

    setState(prev => ({ ...prev, isInitializing: true, contractError: null }));

    try {
      // Check if MetaMask or other web3 provider is available
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        await contractService.initialize(provider, signer);
      } else {
        // Fallback to read-only mode
        await contractService.initialize();
      }

      // Fetch initial contract data
      const [tokenId, auctionId, fee] = await Promise.all([
        contractService.getCurrentTokenId().catch(() => '0'),
        contractService.getCurrentAuctionId().catch(() => '0'),
        contractService.getMarketplaceFee().catch(() => 2.5),
      ]);

      setState(prev => ({
        ...prev,
        isContractConnected: true,
        isInitializing: false,
        currentTokenId: tokenId,
        currentAuctionId: auctionId,
        marketplaceFee: fee,
      }));

      console.log('🎉 Contract integration successful');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initialize contract';
      setState(prev => ({
        ...prev,
        isContractConnected: false,
        isInitializing: false,
        contractError: errorMessage,
      }));
      
      console.error('Contract initialization error:', error);
      toast.error(`Contract Error: ${errorMessage}`);
    }
  };

  const refreshContractData = async () => {
    if (!state.isContractConnected) return;

    try {
      const [tokenId, auctionId] = await Promise.all([
        contractService.getCurrentTokenId(),
        contractService.getCurrentAuctionId(),
      ]);

      setState(prev => ({
        ...prev,
        currentTokenId: tokenId,
        currentAuctionId: auctionId,
      }));
    } catch (error) {
      console.error('Failed to refresh contract data:', error);
    }
  };

  // Initialize contract when wallet connects
  useEffect(() => {
    if (isConnected && selectedAccount) {
      initializeContract();
    } else {
      setState(prev => ({
        ...prev,
        isContractConnected: false,
        contractError: null,
      }));
    }

    // Cleanup listeners on unmount
    return () => {
      contractService.removeAllListeners();
    };
  }, [isConnected, selectedAccount?.address]);

  return {
    ...state,
    initializeContract,
    refreshContractData,
    contractService,
  };
}

