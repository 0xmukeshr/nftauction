export interface Auction {
  id: string;
  nftId: string;
  nft: NFT;
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

export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: Date;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface CreateAuctionRequest {
  nftId: string;
  startPrice: number;
  duration: number; // in hours
  reservePrice?: number;
  buyNowPrice?: number;
}

export interface PlaceBidRequest {
  auctionId: string;
  amount: number;
}

export interface AuctionFilters {
  status?: 'active' | 'ended';
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sortBy?: 'price' | 'time' | 'bids';
  sortOrder?: 'asc' | 'desc';
}

import type { NFT } from './nft';