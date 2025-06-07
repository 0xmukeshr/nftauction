export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
  type?: string;
}

export interface WalletState {
  isConnected: boolean;
  accounts: WalletAccount[];
  selectedAccount: WalletAccount | null;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

export interface PolkadotApi {
  isReady: boolean;
  api: any;
  keyring: any;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockHash?: string;
  blockNumber?: number;
  error?: string;
}