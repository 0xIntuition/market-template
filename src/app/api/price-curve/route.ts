import { NextResponse } from 'next/server'
import { getPoints } from '@/server/curves'
import { getVaultTotals } from '@/server/contracts'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const atomId = searchParams.get('atomId')
  const totalSharesParam = searchParams.get('totalShares')

  if (!atomId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    // Use totalShares from query param if provided, otherwise fetch from contract
    let totalShares: bigint
    if (totalSharesParam) {
      totalShares = BigInt(totalSharesParam)
    } else {
      const vaultTotals = await getVaultTotals(BigInt(atomId))
      totalShares = vaultTotals.totalShares || 0n
    }

    // Calculate the end point (totalShares * 2 with a minimum of 1e17)
    const start = 0n
    const end = totalShares * 2n > 10n ** 17n ? totalShares * 2n : 10n ** 17n

    // Get the price curve points
    const [curvePoints, currentPricePoint] = await getPoints(start, end, totalShares)

    // Transform the points to the format expected by LineChart
    const chartPoints = curvePoints.map(point => ({
      x: Number(point.shares),
      y: Number(point.sharePrice)
    }))

    const specialPoint = {
      x: Number(currentPricePoint.shares),
      y: Number(currentPricePoint.sharePrice)
    }

    return NextResponse.json({
      points: chartPoints,
      specialPoint: specialPoint,
      totalShares: totalShares.toString()
    })
  } catch (error) {
    console.error('Error getting price curve:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch price curve' },
      { status: 500 }
    )
  }
}