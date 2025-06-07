// Polkadot Asset Hub configuration
export const POLKADOT_CONFIG = {
  ASSET_HUB_ENDPOINT: 'wss://polkadot-asset-hub-rpc.polkadot.io',
  CHAIN_DECIMALS: 18,
  CHAIN_TOKEN: 'PAS',
  SS58_FORMAT: 420420421,
};

// IPFS configuration
export const IPFS_CONFIG = {
  GATEWAY_URL: 'https://ipfs.io/ipfs/',
  API_URL: 'https://ipfs.infura.io:5001',
  PROJECT_ID: process.env.NEXT_PUBLIC_IPFS_PROJECT_ID,
  PROJECT_SECRET: process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET,
};

// Application constants
export const APP_CONFIG = {
  NAME: 'Polkadot NFT Marketplace',
  DESCRIPTION: 'Premium NFT marketplace on Polkadot Asset Hub',
  DEFAULT_AUCTION_DURATION: 7 * 24, // 7 days in hours
  MIN_BID_INCREMENT: 0.1, // PAS
  TRANSACTION_TIMEOUT: 60000, // 60 seconds
};

// NFT Categories
export const NFT_CATEGORIES = [
  'Art',
  'Music',
  'Gaming',
  'Sports',
  'Photography',
  'Virtual Worlds',
  'Trading Cards',
  'Collectibles',
  'Utility',
  'Domain Names',
] as const;

// Supported file types for NFT uploads
export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  MODEL: ['model/gltf-binary', 'model/gltf+json'],
};

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  INVALID_ADDRESS: 'Invalid Polkadot address',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_FILE_TYPE: 'Unsupported file type',
  FILE_TOO_LARGE: 'File size too large. Maximum 10MB allowed.',
};