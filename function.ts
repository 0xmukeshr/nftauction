import { ethers, Contract, JsonRpcProvider } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

// Contract ABI - You'll need to replace this with your actual ABI
const NFT_AUCTION_ABI =[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "startingPrice",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "AuctionCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "finalPrice",
				"type": "uint256"
			}
		],
		"name": "AuctionEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "BidPlaced",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "BuyNowPurchase",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "auctions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "startingPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "buyNowPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentBid",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "currentBidder",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			}
		],
		"name": "buyNow",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			}
		],
		"name": "cancelAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startingPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "buyNowPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			}
		],
		"name": "createAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "emergencyWithdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			}
		],
		"name": "endAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "start",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "count",
				"type": "uint256"
			}
		],
		"name": "getActiveAuctions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "seller",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "startingPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "buyNowPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentBid",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "currentBidder",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "active",
						"type": "bool"
					}
				],
				"internalType": "struct NFTAuctionMarketplace.Auction[]",
				"name": "result",
				"type": "tuple[]"
			},
			{
				"internalType": "uint256",
				"name": "total",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			}
		],
		"name": "getAuction",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "tokenId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "seller",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "startingPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "buyNowPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentBid",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "currentBidder",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "active",
						"type": "bool"
					}
				],
				"internalType": "struct NFTAuctionMarketplace.Auction",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentAuctionId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentTokenId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "marketplaceFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "tokenURI",
				"type": "string"
			}
		],
		"name": "mintNFT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "pendingReturns",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "auctionId",
				"type": "uint256"
			}
		],
		"name": "placeBid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_fee",
				"type": "uint256"
			}
		],
		"name": "setMarketplaceFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// Contract configuration
const CONTRACT_ADDRESS = '0x507E13c9924adA6281e02C56bc135d224a3D8c6E';
const RPC_URL = 'https://testnet-passet-hub-eth-rpc.polkadot.io';

// Types
export interface Auction {
  tokenId: string;
  seller: string;
  startingPrice: string;
  buyNowPrice: string;
  currentBid: string;
  currentBidder: string;
  endTime: string;
  active: boolean;
  auctionId?: string;
}

export interface MintResult {
  tokenId: string;
  transactionHash: string;
}

export interface TransactionResult {
  hash: string;
  wait: () => Promise<any>;
}

export interface ContractError extends Error {
  code?: string;
  reason?: string;
}

class NFTAuctionMarketplace {
  private contract: Contract | null = null;
  private signer: ethers.Signer | null = null;
  private provider: JsonRpcProvider;
  private contractAddress: string;

  constructor(contractAddress?: string) {
    this.contractAddress = contractAddress || CONTRACT_ADDRESS;
    this.provider = new JsonRpcProvider(RPC_URL);
  }

  // Initialize the service with optional private key for signing
  async initialize(privateKey?: string): Promise<void> {
    try {
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers.Contract(this.contractAddress, NFT_AUCTION_ABI, this.signer);
      } else if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(this.contractAddress, NFT_AUCTION_ABI, this.signer);
      } else {
        // Read-only mode
        this.contract = new ethers.Contract(this.contractAddress, NFT_AUCTION_ABI, this.provider);
      }
    } catch (error) {
      throw new Error(`Failed to initialize contract: ${error}`);
    }
  }

  // Initialize with external provider and signer (for browser usage)
  async initializeWithExternalProvider(provider: ethers.Provider, signer?: ethers.Signer): Promise<void> {
    try {
      this.provider = provider as JsonRpcProvider;
      this.signer = signer || null;
      
      if (this.signer) {
        this.contract = new ethers.Contract(this.contractAddress, NFT_AUCTION_ABI, this.signer);
      } else {
        this.contract = new ethers.Contract(this.contractAddress, NFT_AUCTION_ABI, this.provider);
      }
    } catch (error) {
      throw new Error(`Failed to initialize contract with external provider: ${error}`);
    }
  }

  // Check if user is connected
  isConnected(): boolean {
    return this.signer !== null && this.contract !== null;
  }

  // Get current user address
  async getCurrentUserAddress(): Promise<string> {
    if (!this.signer) throw new Error('No signer available');
    return await this.signer.getAddress();
  }

  // Get provider
  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  // NFT Functions
  async mintNFT(to: string, tokenURI: string): Promise<MintResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const tx = await this.contract.mintNFT(to, tokenURI);
      const receipt = await tx.wait();
      
      // Extract token ID from Transfer event
      const transferEvent = receipt.events?.find((e: any) => e.event === 'Transfer');
      const tokenId = transferEvent?.args?.tokenId?.toString() || '0';
      
      return {
        tokenId,
        transactionHash: receipt.transactionHash
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to mint NFT');
    }
  }

  async getTokenOwner(tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      return await this.contract.ownerOf(tokenId);
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get token owner');
    }
  }

  async getTokenURI(tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get token URI');
    }
  }

  async approveToken(tokenId: string, spender: string): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const tx = await this.contract.approve(spender, tokenId);
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to approve token');
    }
  }

  // Auction Functions
  async createAuction(
    tokenId: string, 
    startingPrice: string, 
    buyNowPrice: string, 
    durationInSeconds: number
  ): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const startingPriceWei = ethers.parseEther(startingPrice);
      const buyNowPriceWei = buyNowPrice === '0' ? 0 : ethers.parseEther(buyNowPrice);
      
      const tx = await this.contract.createAuction(
        tokenId,
        startingPriceWei,
        buyNowPriceWei,
        durationInSeconds
      );
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to create auction');
    }
  }

  async placeBid(auctionId: string, bidAmount: string): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const bidAmountWei = ethers.parseEther(bidAmount);
      const tx = await this.contract.placeBid(auctionId, { value: bidAmountWei });
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to place bid');
    }
  }

  async buyNow(auctionId: string, buyNowPrice: string): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const priceWei = ethers.parseEther(buyNowPrice);
      const tx = await this.contract.buyNow(auctionId, { value: priceWei });
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to buy now');
    }
  }

  async endAuction(auctionId: string): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const tx = await this.contract.endAuction(auctionId);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to end auction');
    }
  }

  async cancelAuction(auctionId: string): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const tx = await this.contract.cancelAuction(auctionId);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to cancel auction');
    }
  }

  async withdrawReturns(): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const tx = await this.contract.withdraw();
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to withdraw returns');
    }
  }

  // View Functions
  async getAuction(auctionId: string): Promise<Auction | null> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const result = await this.contract.getAuction(auctionId);
      
      if (!result.active && result.tokenId.toString() === '0') {
        return null;
      }
      
      return {
        tokenId: result.tokenId.toString(),
        seller: result.seller,
        startingPrice: ethers.formatEther(result.startingPrice),
        buyNowPrice: result.buyNowPrice.toString() === '0' ? '0' : ethers.formatEther(result.buyNowPrice),
        currentBid: result.currentBid.toString() === '0' ? '0' : ethers.formatEther(result.currentBid),
        currentBidder: result.currentBidder,
        endTime: result.endTime.toString(),
        active: result.active,
        auctionId
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get auction');
    }
  }

  async getActiveAuctions(start: number = 0, count: number = 10): Promise<{ auctions: Auction[], total: number }> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const result = await this.contract.getActiveAuctions(start, count);
      const auctions: Auction[] = result.result.map((auction: any, index: number) => ({
        tokenId: auction.tokenId.toString(),
        seller: auction.seller,
        startingPrice: ethers.formatEther(auction.startingPrice),
        buyNowPrice: auction.buyNowPrice.toString() === '0' ? '0' : ethers.formatEther(auction.buyNowPrice),
        currentBid: auction.currentBid.toString() === '0' ? '0' : ethers.formatEther(auction.currentBid),
        currentBidder: auction.currentBidder,
        endTime: auction.endTime.toString(),
        active: auction.active,
        auctionId: (start + index + 1).toString()
      }));
      
      return {
        auctions,
        total: result.total.toNumber()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get active auctions');
    }
  }

  async getCurrentTokenId(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const result = await this.contract.getCurrentTokenId();
      return result.toString();
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get current token ID');
    }
  }

  async getCurrentAuctionId(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const result = await this.contract.getCurrentAuctionId();
      return result.toString();
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get current auction ID');
    }
  }

  async getPendingReturns(address: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const result = await this.contract.pendingReturns(address);
      return ethers.formatEther(result);
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get pending returns');
    }
  }

  async getMarketplaceFee(): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const result = await this.contract.marketplaceFee();
      return result.toNumber() / 100; // Convert basis points to percentage
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get marketplace fee');
    }
  }

  // Utility Functions
  async isAuctionEnded(auctionId: string): Promise<boolean> {
    const auction = await this.getAuction(auctionId);
    if (!auction) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= parseInt(auction.endTime);
  }

  async getTimeRemaining(auctionId: string): Promise<number> {
    const auction = await this.getAuction(auctionId);
    if (!auction) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = parseInt(auction.endTime);
    
    return Math.max(0, endTime - currentTime);
  }

  formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'Ended';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  // Owner Functions (only for contract owner)
  async setMarketplaceFee(feePercentage: number): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const feeInBasisPoints = Math.floor(feePercentage * 100);
      const tx = await this.contract.setMarketplaceFee(feeInBasisPoints);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to set marketplace fee');
    }
  }

  async emergencyWithdraw(): Promise<TransactionResult> {
    if (!this.contract || !this.signer) throw new Error('Contract not initialized or no signer');
    
    try {
      const tx = await this.contract.emergencyWithdraw();
      
      return {
        hash: tx.hash,
        wait: () => tx.wait()
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to emergency withdraw');
    }
  }

  async getContractOwner(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      return await this.contract.owner();
    } catch (error: any) {
      throw this.handleError(error, 'Failed to get contract owner');
    }
  }

  // Event Listeners
  onAuctionCreated(callback: (auctionId: string, tokenId: string, seller: string, startingPrice: string, endTime: string) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    this.contract.on('AuctionCreated', (auctionId, tokenId, seller, startingPrice, endTime) => {
      callback(
        auctionId.toString(),
        tokenId.toString(),
        seller,
        ethers.formatEther(startingPrice),
        endTime.toString()
      );
    });
  }

  onBidPlaced(callback: (auctionId: string, bidder: string, amount: string) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    this.contract.on('BidPlaced', (auctionId, bidder, amount) => {
      callback(
        auctionId.toString(),
        bidder,
        ethers.formatEther(amount)
      );
    });
  }

  onAuctionEnded(callback: (auctionId: string, winner: string, finalPrice: string) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    this.contract.on('AuctionEnded', (auctionId, winner, finalPrice) => {
      callback(
        auctionId.toString(),
        winner,
        ethers.formatEther(finalPrice)
      );
    });
  }

  onBuyNowPurchase(callback: (auctionId: string, buyer: string, price: string) => void) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    this.contract.on('BuyNowPurchase', (auctionId, buyer, price) => {
      callback(
        auctionId.toString(),
        buyer,
        ethers.formatEther(price)
      );
    });
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  // Error handling
  private handleError(error: any, defaultMessage: string): ContractError {
    const contractError = new Error(defaultMessage) as ContractError;
    
    if (error.reason) {
      contractError.message = error.reason;
      contractError.reason = error.reason;
    } else if (error.message) {
      contractError.message = error.message;
    }
    
    if (error.code) {
      contractError.code = error.code;
    }
    
    return contractError;
  }
}

// Export singleton instance
let marketplaceInstance: NFTAuctionMarketplace | null = null;

export const createMarketplaceService = (contractAddress?: string): NFTAuctionMarketplace => {
  if (!marketplaceInstance) {
    marketplaceInstance = new NFTAuctionMarketplace(contractAddress);
  }
  return marketplaceInstance;
};

// Example usage function
export const initializeMarketplace = async (privateKey?: string): Promise<NFTAuctionMarketplace> => {
  const marketplace = createMarketplaceService();
  await marketplace.initialize(privateKey);
  return marketplace;
};

export default NFTAuctionMarketplace;