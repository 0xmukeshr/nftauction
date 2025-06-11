'use client';

import { useEffect } from 'react';
import { useContractIntegration } from '@/hooks/useContractIntegration';
import { useWallet } from '@/hooks/useWallet';

export function ContractInitializer() {
  const { isConnected, selectedAccount } = useWallet();
  const { isContractConnected, isInitializing, contractError, initializeContract } = useContractIntegration();

  useEffect(() => {
    // Auto-initialize contract when wallet connects
    if (isConnected && selectedAccount && !isContractConnected && !isInitializing) {
      initializeContract();
    }
  }, [isConnected, selectedAccount, isContractConnected, isInitializing, initializeContract]);

  // This component doesn't render anything, it just handles initialization
  return null;
}

