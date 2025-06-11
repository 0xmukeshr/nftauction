// Dynamic imports for browser-only packages
let web3Enable: any, web3Accounts: any, web3FromAddress: any;
let ApiPromise: any, WsProvider: any, cryptoWaitReady: any;

if (typeof window !== 'undefined') {
  // Only load these modules on the client side
  import('@polkadot/extension-dapp').then(module => {
    web3Enable = module.web3Enable;
    web3Accounts = module.web3Accounts;
    web3FromAddress = module.web3FromAddress;
  });
  
  import('@polkadot/api').then(module => {
    ApiPromise = module.ApiPromise;
    WsProvider = module.WsProvider;
  });
  
  import('@polkadot/util-crypto').then(module => {
    cryptoWaitReady = module.cryptoWaitReady;
  });
}

import { PASSET_HUB_CONFIG } from './constants';
import type { WalletAccount } from '@/types/wallet';

class TalismanService {
  private api: any = null;
  private provider: any = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    // Skip initialization on server side
    if (typeof window === 'undefined') {
      console.warn('Talisman service cannot be initialized on server side');
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    try {
      // Wait for dynamic imports to complete
      if (!cryptoWaitReady || !ApiPromise || !WsProvider) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait a bit for imports
      }

      if (!cryptoWaitReady || !ApiPromise || !WsProvider) {
        console.error('Required Polkadot modules not loaded');
        return false;
      }

      await cryptoWaitReady();
      
      this.provider = new WsProvider(PASSET_HUB_CONFIG.RPC_ENDPOINT.replace('https://', 'wss://'));
      this.api = await ApiPromise.create({ provider: this.provider });
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Talisman service:', error);
      return false;
    }
  }

  async enableTalisman(): Promise<boolean> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Talisman wallet can only be accessed in a browser environment');
    }

    if (!web3Enable) {
      throw new Error('Polkadot extension modules not loaded');
    }

    try {
      // Enable Talisman wallet specifically
      const extensions = await web3Enable('PolkaNFT Marketplace');
      
      // Check if Talisman is available
      const talismanExtension = extensions.find(ext => 
        ext.name === 'talisman' || 
        ext.name.toLowerCase().includes('talisman')
      );
      
      if (!talismanExtension) {
        throw new Error('Talisman wallet not found. Please install the Talisman browser extension.');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to enable Talisman:', error);
      throw error;
    }
  }

  async getAccounts(): Promise<WalletAccount[]> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Cannot access wallet accounts in server environment');
      return [];
    }

    if (!web3Accounts) {
      console.warn('web3Accounts not available');
      return [];
    }

    try {
      const accounts = await web3Accounts();
      
      // Filter for Talisman accounts if possible
      const talismanAccounts = accounts.filter(account => 
        account.meta.source === 'talisman' || 
        account.meta.source.toLowerCase().includes('talisman')
      );
      
      // If no Talisman accounts found, return all accounts
      const accountsToReturn = talismanAccounts.length > 0 ? talismanAccounts : accounts;
      
      return accountsToReturn.map(account => ({
        address: account.address,
        meta: account.meta,
        type: account.type,
      }));
    } catch (error) {
      console.error('Failed to get Talisman accounts:', error);
      return [];
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      // Use ethers to get balance from Passet Hub (Ethereum-compatible RPC)
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider(PASSET_HUB_CONFIG.RPC_ENDPOINT);
      const balance = await provider.getBalance(address);
      const formatted = ethers.formatEther(balance);
      return formatted;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async signAndSendTransaction(
    transaction: any,
    senderAddress: string
  ): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized');
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Transaction signing can only be performed in a browser environment');
    }
    
    if (!web3FromAddress) {
      throw new Error('web3FromAddress not available');
    }
    
    try {
      const injector = await web3FromAddress(senderAddress);
      const hash = await transaction.signAndSend(senderAddress, { signer: injector.signer });
      return hash.toString();
    } catch (error) {
      console.error('Failed to sign and send transaction:', error);
      throw new Error('Transaction failed');
    }
  }

  async createNFTCollection(
    name: string,
    description: string,
    senderAddress: string
  ): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized');
    }
    
    try {
      // Create collection using the NFTs pallet
      const tx = this.api.tx.nfts.create(
        senderAddress, // admin
        {
          settings: 0,
          maxSupply: null,
          mintSettings: {
            mintType: 'Issuer',
            price: null,
            startBlock: null,
            endBlock: null,
            defaultItemSettings: 0,
          },
        }
      );

      return await this.signAndSendTransaction(tx, senderAddress);
    } catch (error) {
      console.error('Failed to create NFT collection:', error);
      throw new Error('Failed to create NFT collection');
    }
  }

  async mintNFT(
    collectionId: number,
    recipient: string,
    metadata: any,
    senderAddress: string
  ): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized');
    }
    
    try {
      const itemId = Date.now(); // Simple item ID generation
      
      // Mint NFT
      const tx = this.api.tx.nfts.mint(
        collectionId,
        itemId,
        recipient,
        null
      );

      const hash = await this.signAndSendTransaction(tx, senderAddress);
      
      // Set metadata (in a real implementation, you'd wait for the mint to complete first)
      await this.setNFTMetadata(collectionId, itemId, metadata, senderAddress);
      
      return hash;
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw new Error('Failed to mint NFT');
    }
  }

  async setNFTMetadata(
    collectionId: number,
    itemId: number,
    metadata: any,
    senderAddress: string
  ): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized');
    }
    
    try {
      const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
      
      const tx = this.api.tx.nfts.setMetadata(collectionId, itemId, metadataBytes);
      return await this.signAndSendTransaction(tx, senderAddress);
    } catch (error) {
      console.error('Failed to set NFT metadata:', error);
      throw new Error('Failed to set NFT metadata');
    }
  }

  async transferNFT(
    collectionId: number,
    itemId: number,
    recipient: string,
    senderAddress: string
  ): Promise<string> {
    if (!this.api) {
      throw new Error('API not initialized');
    }
    
    try {
      const tx = this.api.tx.nfts.transfer(collectionId, itemId, recipient);
      return await this.signAndSendTransaction(tx, senderAddress);
    } catch (error) {
      console.error('Failed to transfer NFT:', error);
      throw new Error('Failed to transfer NFT');
    }
  }

  async createAuction(
    nftId: string,
    startPrice: number,
    duration: number,
    reservePrice?: number,
    senderAddress?: string
  ): Promise<string> {
    // Placeholder for auction creation
    // In a real implementation, this would interact with an auction pallet or smart contract
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return `auction_${Date.now()}`;
    } catch (error) {
      console.error('Failed to create auction:', error);
      throw new Error('Failed to create auction');
    }
  }

  async placeBid(
    auctionId: string,
    bidAmount: number,
    senderAddress: string
  ): Promise<string> {
    // Placeholder for bid placement
    // In a real implementation, this would interact with an auction pallet or smart contract
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return `bid_${Date.now()}`;
    } catch (error) {
      console.error('Failed to place bid:', error);
      throw new Error('Failed to place bid');
    }
  }

  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
    this.api = null;
  }

  // Utility methods
  isValidAddress(address: string): boolean {
    try {
      // Basic validation - in a real implementation, use proper address validation
      return address.length >= 47 && address.length <= 48;
    } catch {
      return false;
    }
  }

  formatBalance(balance: string): string {
    // Remove commas and format for display
    return balance.replace(/,/g, '');
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const talismanService = new TalismanService();