import { createMarketplaceService, type Auction as ContractAuction, type MintResult, type TransactionResult } from '@/Contract/function';
import { ethers } from 'ethers';

class ContractService {
  private marketplace: any = null;
  private isInitialized = false;

  async initialize(provider?: ethers.Provider, signer?: ethers.Signer) {
    try {
      this.marketplace = createMarketplaceService();
      
      if (provider && signer) {
        await this.marketplace.initializeWithExternalProvider(provider, signer);
      } else {
        await this.marketplace.initialize();
      }
      
      this.isInitialized = true;
      console.log('✅ Contract service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize contract service:', error);
      throw error;
    }
  }

  ensureInitialized() {
    if (!this.isInitialized || !this.marketplace) {
      throw new Error('Contract service not initialized. Call initialize() first.');
    }
  }

  // NFT Functions
  async mintNFT(to: string, tokenURI: string): Promise<MintResult> {
    this.ensureInitialized();
    return await this.marketplace.mintNFT(to, tokenURI);
  }

  async getTokenOwner(tokenId: string): Promise<string> {
    this.ensureInitialized();
    return await this.marketplace.getTokenOwner(tokenId);
  }

  async getTokenURI(tokenId: string): Promise<string> {
    this.ensureInitialized();
    return await this.marketplace.getTokenURI(tokenId);
  }

  async approveToken(tokenId: string, spender: string): Promise<TransactionResult> {
    this.ensureInitialized();
    return await this.marketplace.approveToken(tokenId, spender);
  }

  // Auction Functions
  async createAuction(
    tokenId: string,
    startingPrice: string,
    buyNowPrice: string,
    durationInSeconds: number
  ): Promise<TransactionResult> {
    this.ensureInitialized();
    return await this.marketplace.createAuction(tokenId, startingPrice, buyNowPrice, durationInSeconds);
  }

  async placeBid(auctionId: string, bidAmount: string): Promise<TransactionResult> {
    this.ensureInitialized();
    return await this.marketplace.placeBid(auctionId, bidAmount);
  }

  async buyNow(auctionId: string, buyNowPrice: string): Promise<TransactionResult> {
    this.ensureInitialized();
    return await this.marketplace.buyNow(auctionId, buyNowPrice);
  }

  async endAuction(auctionId: string): Promise<TransactionResult> {
    this.ensureInitialized();
    return await this.marketplace.endAuction(auctionId);
  }

  async cancelAuction(auctionId: string): Promise<TransactionResult> {
    this.ensureInitialized();
    return await this.marketplace.cancelAuction(auctionId);
  }

  async withdrawReturns(): Promise<TransactionResult> {
    this.ensureInitialized();
    return await this.marketplace.withdrawReturns();
  }

  // View Functions
  async getAuction(auctionId: string): Promise<ContractAuction | null> {
    this.ensureInitialized();
    return await this.marketplace.getAuction(auctionId);
  }

  async getActiveAuctions(start: number = 0, count: number = 10): Promise<{ auctions: ContractAuction[], total: number }> {
    this.ensureInitialized();
    return await this.marketplace.getActiveAuctions(start, count);
  }

  async getCurrentTokenId(): Promise<string> {
    this.ensureInitialized();
    return await this.marketplace.getCurrentTokenId();
  }

  async getCurrentAuctionId(): Promise<string> {
    this.ensureInitialized();
    return await this.marketplace.getCurrentAuctionId();
  }

  async getPendingReturns(address: string): Promise<string> {
    this.ensureInitialized();
    return await this.marketplace.getPendingReturns(address);
  }

  async getMarketplaceFee(): Promise<number> {
    this.ensureInitialized();
    return await this.marketplace.getMarketplaceFee();
  }

  // Utility Functions
  async isAuctionEnded(auctionId: string): Promise<boolean> {
    this.ensureInitialized();
    return await this.marketplace.isAuctionEnded(auctionId);
  }

  async getTimeRemaining(auctionId: string): Promise<number> {
    this.ensureInitialized();
    return await this.marketplace.getTimeRemaining(auctionId);
  }

  formatTimeRemaining(seconds: number): string {
    this.ensureInitialized();
    return this.marketplace.formatTimeRemaining(seconds);
  }

  // Event Listeners
  onAuctionCreated(callback: (auctionId: string, tokenId: string, seller: string, startingPrice: string, endTime: string) => void) {
    this.ensureInitialized();
    this.marketplace.onAuctionCreated(callback);
  }

  onBidPlaced(callback: (auctionId: string, bidder: string, amount: string) => void) {
    this.ensureInitialized();
    this.marketplace.onBidPlaced(callback);
  }

  onAuctionEnded(callback: (auctionId: string, winner: string, finalPrice: string) => void) {
    this.ensureInitialized();
    this.marketplace.onAuctionEnded(callback);
  }

  onBuyNowPurchase(callback: (auctionId: string, buyer: string, price: string) => void) {
    this.ensureInitialized();
    this.marketplace.onBuyNowPurchase(callback);
  }

  removeAllListeners() {
    if (this.marketplace) {
      this.marketplace.removeAllListeners();
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.isInitialized && this.marketplace?.isConnected();
  }

  async getCurrentUserAddress(): Promise<string> {
    this.ensureInitialized();
    return await this.marketplace.getCurrentUserAddress();
  }

  getProvider() {
    this.ensureInitialized();
    return this.marketplace.getProvider();
  }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService;

