'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { talismanService } from '@/lib/talisman';
import type { WalletState, WalletAccount } from '@/types/wallet';

interface WalletStore extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (account: WalletAccount) => void;
  refreshBalance: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useWallet = create<WalletStore>()(
  persist(
    (set, get) => ({
      isConnected: false,
      accounts: [],
      selectedAccount: null,
      balance: '0',
      isLoading: false,
      error: null,

      connectWallet: async () => {
        // Skip wallet connection on server side
        if (typeof window === 'undefined') {
          console.warn('Wallet connection not available on server side');
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          // Initialize Talisman service
          const initialized = await talismanService.initialize();
          if (!initialized) {
            throw new Error('Failed to initialize wallet connection');
          }
          
          // Enable Talisman wallet
          await talismanService.enableTalisman();

          // Get accounts
          const accounts = await talismanService.getAccounts();
          if (accounts.length === 0) {
            throw new Error('No accounts found. Please create an account in Talisman wallet.');
          }

          // Select first account by default
          const selectedAccount = accounts[0];
          const balance = await talismanService.getBalance(selectedAccount.address);

          console.log("Selected account :", selectedAccount.address);

          set({
            isConnected: true,
            accounts,
            selectedAccount,
            balance: talismanService.formatBalance(balance),
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
          set({
            isConnected: false,
            accounts: [],
            selectedAccount: null,
            balance: '0',
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      disconnectWallet: () => {
        talismanService.disconnect();
        set({
          isConnected: false,
          accounts: [],
          selectedAccount: null,
          balance: '0',
          error: null,
        });
      },

      selectAccount: async (account: WalletAccount) => {
        // Skip account selection on server side
        if (typeof window === 'undefined') {
          return;
        }

        set({ isLoading: true });
        
        try {
          const balance = await talismanService.getBalance(account.address);
          set({
            selectedAccount: account,
            balance: talismanService.formatBalance(balance),
            isLoading: false,
          });
          console.log("Account selected :", account);
        } catch (error) {
          console.error('Failed to select account:', error);
          set({ isLoading: false });
        }
      },

      refreshBalance: async () => {
        // Skip balance refresh on server side
        if (typeof window === 'undefined') {
          return;
        }

        const { selectedAccount } = get();
        if (!selectedAccount) return;

        try {
          const balance = await talismanService.getBalance(selectedAccount.address);
          set({ balance: talismanService.formatBalance(balance) });
        } catch (error) {
          console.error('Failed to refresh balance:', error);
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'talisman-wallet-storage',
      partialize: (state) => ({
        isConnected: state.isConnected,
        selectedAccount: state.selectedAccount,
      }),
    }
  )
);