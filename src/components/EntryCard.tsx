'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { Badge, Text, Card, PieChart, Button, Separator } from '@0xintuition/1ui'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Entry } from '@/types'
import { formatValue } from '@/lib/formatValue'
import { SwapModal, type SwapType } from '@/components/SwapModal'

// Create a public client for ENS lookups (always use mainnet for ENS)
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

type EntryStats = {
  userState: {
    shares: string
    assets: string
  }
  vaultTotals: {
    totalShares: string
    totalAssets: string
  }
  sharePrice: string
}

interface EntryCardProps {
  entry: Entry & { stats?: EntryStats }
  showShare?: boolean
  truncate?: boolean
}

export function EntryCard({ entry, showShare = false, truncate = true }: EntryCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapType, setSwapType] = useState<SwapType>('deposit')
  const [shareClicked, setShareClicked] = useState(false)
  const { primaryWallet } = useDynamicContext()
  const [stats, setStats] = useState<EntryStats | undefined>(entry.stats)
  const [userBalance, setUserBalance] = useState('0')
  const [creatorEns, setCreatorEns] = useState<string | null>(null)

  const fetchStats = async () => {
    const userAddress = !primaryWallet?.address ? '0x0000000000000000000000000000000000000000' : primaryWallet.address

    try {
      const response = await fetch(`/api/atom-stats?atomId=${entry.id}&userAddress=${userAddress}`)
      if (!response.ok) throw new Error('Failed to fetch atom stats')
      const data = await response.json()
      console.log('Fetched atom stats:', data)
      setStats(data)
    } catch (err) {
      console.error('Error fetching atom stats:', err)
    }
  }

  const fetchBalance = async () => {
    if (!primaryWallet?.address || !isEthereumWallet(primaryWallet)) return
    try {
      const publicClient = await primaryWallet.getPublicClient()
      const balance = await publicClient.getBalance({
        address: primaryWallet.address as `0x${string}`,
      })
      setUserBalance(balance.toString())
    } catch (err) {
      console.error('Error fetching balance:', err)
    }
  }

  const fetchCreatorEns = async () => {
    try {
      const ensName = await ensClient.getEnsName({
        address: entry.creator as `0x${string}`,
      })
      setCreatorEns(ensName)
    } catch (err) {
      console.error('Error fetching ENS name:', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [entry.id, primaryWallet?.address])

  useEffect(() => {
    fetchBalance()
  }, [primaryWallet?.address])

  useEffect(() => {
    fetchCreatorEns()
  }, [entry.creator])

  const handleSwapSuccess = async () => {
    // Refresh both stats and balance
    await Promise.all([fetchStats(), fetchBalance()])
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (navigator.share) {
        await navigator.share({
          title: entry.name,
          text: entry.description,
          url: `${window.location.origin}/entry/${entry.id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/entry/${entry.id}`)
      }
      setShareClicked(true)
      setTimeout(() => setShareClicked(false), 2000)
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  // Calculate ownership percentage
  const ownershipPercentageShares = stats?.userState
    ? (Number(stats.userState.shares) / Number(stats.vaultTotals.totalShares)) * 100
    : 0

  const ownershipPercentageAssets = stats?.userState
    ? (Number(stats.userState.assets) / Number(stats.vaultTotals.totalAssets)) * 100
    : 0

  return (
    <div
      className="w-full rounded-xl p-2 border border-white/20"
      style={{
        background: `linear-gradient(to top, transparent 0%, rgba(251, 255, 0, 0.07) 100%, transparent 5%),
          linear-gradient(to right, transparent 0%, rgba(70, 70, 70, 0.05) 100%, transparent 5%),
          linear-gradient(to bottom, transparent 0%, rgba(77, 77, 77, 0.05) 100%, transparent 5%),
          linear-gradient(to left, transparent 0%, rgba(144, 155, 207, 0.12) 100%, transparent 5%)`,
      }}
    >
      {/* Main grid container with 3:1 ratio */}
      <style jsx>{`
        @media (max-width: 640px) {
          .entry-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 2rem !important;
          }
        }
      `}</style>
      <div className="entry-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        {/* Left column - Atom Info Section */}
        <div
          className="flex flex-col gap-2 p-4 rounded-xl border border-white/20 relative"
          style={{ background: '#000000' }}
        >
          {showShare && (
            <Button
              variant="ghost"
              size="md"
              onClick={handleShare}
              className="absolute top-4 right-4 text-sm border border-white/20 hover:text-white/80 transition-colors"
            >
              {shareClicked ? 'Link Copied ✓' : 'Share ↗'}
            </Button>
          )}
          {!imageError && entry.image && (
            <div className="w-16 aspect-square border border-white/20 rounded-lg overflow-hidden">
              <Image
                src={entry.image}
                alt={entry.name}
                width={64}
                height={64}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                onError={handleImageError}
              />
            </div>
          )}
          <h1>
            {truncate ? entry.name.slice(0, 40) : entry.name}
            {truncate && entry.name.length > 40 ? '...' : ''}
          </h1>
          <p>
            {truncate ? entry.description.slice(0, 100) : entry.description}
            {truncate && entry.description.length > 100 ? '...' : ''}
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              {entry.numSubEntries !== undefined && <Badge variant="info">{entry.numSubEntries} Sub-Entries</Badge>}
            </div>
            <div className="flex gap-2 items-center">
              <Text variant="caption">Created By: </Text>
              <Text variant="caption" className="text-white/70">
                {creatorEns || `${entry.creator.slice(0, 6)}...${entry.creator.slice(-4)}`}
              </Text>
            </div>
          </div>
          {entry.url && (
            <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="md"
                className="w-fit"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(
                    entry.url.startsWith('http') ? entry.url : `https://${entry.url}`,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }}
              >
                {truncate ? entry.url.slice(0, 40) : entry.url}
                {truncate && entry.url.length > 40 ? '...' : ''} ↗
              </Button>
            </div>
          )}
        </div>

        {/* Middle column - Combined Economics */}
        <Card className="p-4 relative" style={{ background: '#000000' }}>
          {showSwapModal && primaryWallet ? (
            <SwapModal
              type={swapType}
              atomId={entry.id}
              sharePrice={stats?.sharePrice || '0'}
              userShares={stats?.userState?.shares || '0'}
              userEthBalance={userBalance}
              totalShares={stats?.vaultTotals?.totalShares || '0'}
              totalAssets={stats?.vaultTotals?.totalAssets || '0'}
              onClose={() => setShowSwapModal(false)}
              onSuccess={handleSwapSuccess}
            />
          ) : (
            <>
              {/* Title with container effect */}
              <div className="relative mb-6">
                <Separator
                  orientation="horizontal"
                  decorative
                  className="absolute"
                  style={{
                    backgroundColor: 'white',
                    opacity: '1',
                    height: '1px',
                    width: 'calc(100% + 2rem)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '-1rem',
                  }}
                />
                <div className="flex justify-center">
                  <Text variant="h3" className="relative px-4 mx-auto" style={{ background: '#000000' }}>
                    Vault Overview
                  </Text>
                </div>
              </div>

              {/* Vertical separator */}
              <Separator
                orientation="vertical"
                decorative
                className="absolute"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  opacity: '1',
                  width: '1px',
                  top: '3rem',
                  height: 'calc(100% - 3rem)',
                }}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Text variant="caption">Total Assets</Text>
                  <Text variant="body">
                    {formatValue(BigInt(stats?.vaultTotals?.totalAssets || '0'), false, false)} ETH
                  </Text>
                  <Text variant="caption">Total Shares</Text>
                  <Text variant="body">{formatValue(BigInt(stats?.vaultTotals?.totalShares || '0'), true, false)}</Text>
                  <Text variant="caption">Share Price</Text>
                  <Text variant="body">{formatValue(BigInt(stats?.sharePrice || '0'), false, false)} : 1</Text>
                </div>
                <div className="text-right">
                  <Text variant="caption">Your Assets</Text>
                  <Text variant="body">
                    {primaryWallet?.address
                      ? `${formatValue(BigInt(stats?.userState?.assets || '0'), false, false)} ETH`
                      : '? ETH'}
                  </Text>
                  <Text variant="caption">Your Shares</Text>
                  <Text variant="body">
                    {primaryWallet?.address
                      ? `${formatValue(BigInt(stats?.userState?.shares || '0'), true, false)}`
                      : '?'}
                  </Text>
                  <Text variant="caption">Your Ownership</Text>
                  <Text variant="body">
                    {primaryWallet?.address ? `${ownershipPercentageShares.toFixed(2)}%` : '?'}
                  </Text>
                </div>
              </div>

              <div className="flex justify-between items-center w-full mt-4">
                <div className="flex items-center gap-2">
                  {primaryWallet?.address && <Text variant="caption">Shares</Text>}
                  <PieChart
                    variant={primaryWallet?.address ? 'forVsAgainst' : 'default'}
                    size="sm"
                    percentage={primaryWallet?.address ? ownershipPercentageShares : 0}
                  />
                  <Text variant="caption">
                    {primaryWallet?.address ? `${ownershipPercentageShares.toFixed(2)}%` : ''}
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <Text variant="caption">
                    {primaryWallet?.address ? `${ownershipPercentageAssets.toFixed(2)}%` : ''}
                  </Text>
                  <PieChart
                    variant={primaryWallet?.address ? 'forVsAgainst' : 'default'}
                    size="sm"
                    percentage={primaryWallet?.address ? ownershipPercentageAssets : 0}
                  />
                  {primaryWallet?.address && <Text variant="caption">Assets</Text>}
                </div>
              </div>

              <div className="flex justify-between gap-2 mt-4">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!primaryWallet?.address}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSwapType('deposit')
                    setShowSwapModal(true)
                  }}
                >
                  Deposit
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={!primaryWallet?.address}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSwapType('redeem')
                    setShowSwapModal(true)
                  }}
                >
                  Redeem
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
