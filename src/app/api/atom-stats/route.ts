import { NextResponse } from 'next/server'
import { getVaultState, getVaultTotals, getCurrentSharePrice } from '@/server/contracts'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const atomId = searchParams.get('atomId')
  const userAddress = searchParams.get('userAddress')

  if (!atomId || !userAddress) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    const [userState, vaultTotals, sharePrice] = await Promise.all([
      getVaultState(BigInt(atomId), userAddress),
      getVaultTotals(BigInt(atomId)),
      getCurrentSharePrice(BigInt(atomId))
    ])

    console.log('userState', userState)
    console.log('vaultTotals', vaultTotals)
    console.log('sharePrice', sharePrice)

    return NextResponse.json({
      userState: {
        shares: userState.shares.toString(),
        assets: userState.assets.toString()
      },
      vaultTotals: {
        totalShares: vaultTotals.totalShares.toString(),
        totalAssets: vaultTotals.totalAssets.toString()
      },
      sharePrice: sharePrice.toString()
    })
  } catch (error) {
    console.error('Error getting atom stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch atom stats' },
      { status: 500 }
    )
  }
} 