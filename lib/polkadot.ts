import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { POLKADOT_CONFIG } from './constants';
import type { WalletAccount, PolkadotApi, TransactionStatus } from '@/types/wallet';
import type { NFTMetadata, CreateNFTRequest, CreateCollectionRequest } from '@/types/nft';

class PolkadotService {
  private api: ApiPromise | null = null;
  private keyring: Keyring | null = null;
  private provider: WsProvider | null = null;

  async initialize(): Promise<PolkadotApi> {
    try {
      await cryptoWaitReady();
      
      this.provider = new WsProvider(POLKADOT_CONFIG.ASSET_HUB_ENDPOINT);
      this.api = await ApiPromise.create({ provider: this.provider });
      
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: POLKADOT_CONFIG.SS58_FORMAT });
      
      return {
        isReady: true,
        api: this.api,
        keyring: this.keyring,
      };
    } catch (error) {
      console.error('Failed to initialize Polkadot API:', error);
      throw new Error('Failed to connect to Polkadot network');
    }
  }

  async enableWallet(): Promise<boolean> {
    try {
      const extensions = await web3Enable('Polkadot NFT Marketplace');
      return extensions.length > 0;
    } catch (error) {
      console.error('Failed to enable wallet:', error);
      return false;
    }
  }

  async getAccounts(): Promise<WalletAccount[]> {
    try {
      const accounts = await web3Accounts();
      return accounts.map(account => ({
        address: account.address,
        meta: account.meta,
        type: account.type,
      }));
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.api) throw new Error('API not initialized');
    
    try {
      const { data: { free } } = await this.api.query.system.account(address);
      return this.api.createType('Balance', free).toHuman();
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async createCollection(request: CreateCollectionRequest, senderAddress: string): Promise<number> {
    if (!this.api) throw new Error('API not initialized');
    
    try {
      const injector = await web3FromAddress(senderAddress);
      
      // Create collection using the NFTs pallet
      const tx = this.api.tx.nfts.create(
        senderAddress, // admin
        {
          settings: 0, // collection settings
          maxSupply: null, // no max supply
          mintSettings: {
            mintType: 'Issuer',
            price: null,
            startBlock: null,
            endBlock: null,
            defaultItemSettings: 0,
          },
        }
      );

      const hash = await tx.signAndSend(senderAddress, { signer: injector.signer });
      
      // In a real implementation, you'd listen for the collection creation event
      // and return the actual collection ID
      return Date.now(); // Temporary ID for demo
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw new Error('Failed to create NFT collection');
    }
  }

  async mintNFT(request: CreateNFTRequest, senderAddress: string): Promise<string> {
    if (!this.api) throw new Error('API not initialized');
    
    try {
      const injector = await web3FromAddress(senderAddress);
      const recipient = request.recipient || senderAddress;
      
      // Mint NFT using the NFTs pallet
      const tx = this.api.tx.nfts.mint(
        request.collectionId,
        Date.now(), // item ID (should be unique)
        recipient,
        null // witness data
      );

      const hash = await tx.signAndSend(senderAddress, { signer: injector.signer });
      
      // Set metadata for the NFT
      await this.setNFTMetadata(
        request.collectionId,
        Date.now(),
        request.metadata,
        senderAddress
      );

      return hash.toString();
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw new Error('Failed to mint NFT');
    }
  }

  async setNFTMetadata(
    collectionId: number,
    itemId: number,
    metadata: NFTMetadata,
    senderAddress: string
  ): Promise<string> {
    if (!this.api) throw new Error('API not initialized');
    
    try {
      const injector = await web3FromAddress(senderAddress);
      
      // Convert metadata to bytes
      const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
      
      const tx = this.api.tx.nfts.setMetadata(collectionId, itemId, metadataBytes);
      const hash = await tx.signAndSend(senderAddress, { signer: injector.signer });
      
      return hash.toString();
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
    if (!this.api) throw new Error('API not initialized');
    
    try {
      const injector = await web3FromAddress(senderAddress);
      
      const tx = this.api.tx.nfts.transfer(collectionId, itemId, recipient);
      const hash = await tx.signAndSend(senderAddress, { signer: injector.signer });
      
      return hash.toString();
    } catch (error) {
      console.error('Failed to transfer NFT:', error);
      throw new Error('Failed to transfer NFT');
    }
  }

  async queryNFTOwnership(collectionId: number, itemId: number): Promise<string | null> {
    if (!this.api) throw new Error('API not initialized');
    
    try {
      const owner = await this.api.query.nfts.item(collectionId, itemId);
      return owner.isSome ? owner.unwrap().owner.toString() : null;
    } catch (error) {
      console.error('Failed to query NFT ownership:', error);
      return null;
    }
  }

  async subscribeToTransactionStatus(
    hash: string,
    callback: (status: TransactionStatus) => void
  ): Promise<() => void> {
    if (!this.api) throw new Error('API not initialized');
    
    return this.api.rpc.chain.subscribeNewHeads((lastHeader) => {
      // Simplified transaction status tracking
      // In a real implementation, you'd check the actual transaction status
      callback({
        hash,
        status: 'confirmed',
        blockHash: lastHeader.hash.toString(),
        blockNumber: lastHeader.number.toNumber(),
      });
    });
  }

  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
    this.api = null;
    this.keyring = null;
  }
}

export const polkadotService = new PolkadotService();