import { create } from 'ipfs-http-client';
import { IPFS_CONFIG } from './constants';

class IPFSService {
  private client: any = null;

  constructor() {
    if (IPFS_CONFIG.PROJECT_ID && IPFS_CONFIG.PROJECT_SECRET) {
      const auth = 'Basic ' + Buffer.from(
        IPFS_CONFIG.PROJECT_ID + ':' + IPFS_CONFIG.PROJECT_SECRET
      ).toString('base64');

      this.client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth,
        },
      });
    }
  }

  async uploadFile(file: File): Promise<string> {
    if (!this.client) {
      throw new Error('IPFS client not configured');
    }

    try {
      const added = await this.client.add(file);
      return added.path;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadJSON(data: any): Promise<string> {
    if (!this.client) {
      throw new Error('IPFS client not configured');
    }

    try {
      const jsonString = JSON.stringify(data);
      const added = await this.client.add(jsonString);
      return added.path;
    } catch (error) {
      console.error('Failed to upload JSON to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  getGatewayUrl(hash: string): string {
    return `${IPFS_CONFIG.GATEWAY_URL}${hash}`;
  }

  async uploadNFTMetadata(metadata: {
    name: string;
    description: string;
    image: File;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  }): Promise<string> {
    try {
      // First upload the image
      const imageHash = await this.uploadFile(metadata.image);
      const imageUrl = this.getGatewayUrl(imageHash);

      // Then upload the metadata JSON
      const metadataJson = {
        name: metadata.name,
        description: metadata.description,
        image: imageUrl,
        attributes: metadata.attributes || [],
      };

      const metadataHash = await this.uploadJSON(metadataJson);
      return this.getGatewayUrl(metadataHash);
    } catch (error) {
      console.error('Failed to upload NFT metadata:', error);
      throw new Error('Failed to upload NFT metadata');
    }
  }
}

export const ipfsService = new IPFSService();