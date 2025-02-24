import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Button } from '@0xintuition/1ui'
import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

// Create a public client for ENS lookups (always use mainnet for ENS)
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export function AuthButton() {
  const { primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext()
  const [ensName, setEnsName] = useState<string | null>(null)

  useEffect(() => {
    const fetchEns = async () => {
      if (!primaryWallet?.address) return
      try {
        const name = await ensClient.getEnsName({
          address: primaryWallet.address as `0x${string}`,
        })
        setEnsName(name)
      } catch (err) {
        console.error('Error fetching ENS name:', err)
      }
    }
    fetchEns()
  }, [primaryWallet?.address])

  return (
    <div className="flex items-center gap-2">
      {primaryWallet ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {ensName || `${primaryWallet.address?.slice(0, 6)}...${primaryWallet.address?.slice(-4)}`}
          </span>
          <Button variant="secondary" onClick={handleLogOut}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setShowAuthFlow(true)}>
          Connect
        </Button>
      )}
    </div>
  )
}
