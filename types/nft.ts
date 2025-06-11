export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  animation_url?: string;
  background_color?: string;
  tokenURI?: string;
}

export interface NFT {
  id: string;
  collectionId: number;
  itemId: number;
  owner: string;
  creator: string;
  metadata: NFTMetadata;
  price?: number;
  isForSale: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Contract integration fields
  contractTokenId?: string;
  transactionHash?: string;
}

export interface NFTCollection {
  id: number;
  owner: string;
  name: string;
  description: string;
  image: string;
  totalSupply: number;
  floorPrice?: number;
  volume?: number;
  createdAt: Date;
}

export interface CreateNFTRequest {
  collectionId: number;
  metadata: NFTMetadata;
  recipient?: string;
}

export interface CreateCollectionRequest {
  name: string;
  description: string;
  image: string;
  symbol?: string;
}