'use client';

import { useWallet } from '@/hooks/useWallet';
import { useContractIntegration } from '@/hooks/useContractIntegration';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, Copy, ExternalLink, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import Image from 'next/image';

export function WalletConnect() {
  const { 
    isConnected, 
    selectedAccount, 
    balance, 
    accounts,
    isLoading, 
    error,
    connectWallet, 
    disconnectWallet,
    selectAccount,
    refreshBalance,
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Talisman wallet connected successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      toast.error(errorMessage);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success('Wallet disconnected');
  };

  const copyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return balance.replace(/,/g, '');
  };

  if (error) {
    return (
      <div className="glass rounded-lg p-4 border border-red-500/50 max-w-sm">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <Button onClick={handleConnect} className="bg-red-500 hover:bg-red-600 w-full">
          <Zap className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnect} 
        disabled={isLoading}
        className="glass-hover neon-pink rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/50 hover:from-pink-500/30 hover:to-purple-500/30"
      >
        {isLoading ? (
          <div className="loading-spinner w-4 h-4 mr-2" />
        ) : (
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 rounded bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">T</span>
            </div>
          </div>
        )}
        Connect Talisman
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="glass-hover rounded-lg flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {selectedAccount?.meta.name?.[0] || 'T'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-white">
                {selectedAccount?.meta.name || 'Talisman Account'}
              </div>
              <div className="text-xs text-gray-400">
                {formatBalance(balance)} PAS
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass border-white/20 w-80" align="end">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">T</span>
              </div>
              <span className="text-sm font-medium text-white">Talisman Wallet</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalance}
              className="text-xs text-pink-400 hover:text-pink-300"
            >
              Refresh
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-white font-medium">{selectedAccount?.meta.name}</div>
            <div className="text-xs text-gray-400 font-mono break-all">
              {selectedAccount && formatAddress(selectedAccount.address)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-pink-400">
                {formatBalance(balance)} PAS
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Connected</span>
              </div>
            </div>
          </div>
        </div>
        
        {accounts.length > 1 && (
          <>
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">Switch Account</div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {accounts.map((account) => (
                  <DropdownMenuItem
                    key={account.address}
                    onClick={() => selectAccount(account)}
                    className={`cursor-pointer rounded-lg p-3 ${
                      selectedAccount?.address === account.address 
                        ? 'bg-pink-500/20 border border-pink-500/50' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {account.meta.name?.[0] || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{account.meta.name}</div>
                        <div className="text-xs text-gray-400 font-mono truncate">
                          {formatAddress(account.address)}
                        </div>
                      </div>
                      {selectedAccount?.address === account.address && (
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        
        <div className="p-2">
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer rounded-lg p-3 hover:bg-white/5">
            <Copy className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-white">Copy Address</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => window.open(`https://polkadot.subscan.io/account/${selectedAccount?.address}`, '_blank')}
            className="cursor-pointer rounded-lg p-3 hover:bg-white/5"
          >
            <ExternalLink className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-white">View on Explorer</span>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleDisconnect}
            className="cursor-pointer rounded-lg p-3 hover:bg-red-500/10 text-red-400"
          >
            <Wallet className="w-4 h-4 mr-3" />
            <span>Disconnect Wallet</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}