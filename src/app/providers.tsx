'use client'

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { base, baseSepolia } from 'viem/chains'
import { clientEnv } from '@/lib/env'
import { useCallback } from 'react'

// add any providers here, such as privy, wagmi, react query, etc.

export function Providers({ children }: { children: React.ReactNode }) {
  // Get chain based on environment
  const chain = clientEnv.ENVIRONMENT === 'production' ? base : baseSepolia

  const getEvmNetworks = useCallback(() => {
    const networkConfig = {
      blockExplorerUrls: [chain.blockExplorers?.default.url],
      chainId: chain.id,
      chainName: chain.name,
      iconUrls: [],
      name: chain.name,
      nativeCurrency: chain.nativeCurrency,
      networkId: chain.id,
      rpcUrls: [...chain.rpcUrls.default.http],
      vanityName: chain.name,
    }
    return [networkConfig]
  }, [chain])

  return (
    <DynamicContextProvider
      settings={{
        environmentId: clientEnv.DYNAMIC_ENVIRONMENT_ID as string,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: getEvmNetworks,
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}
