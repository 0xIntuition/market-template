import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { serverEnv } from '@/lib/env'
import { extractAtomIdFromReceipt } from '@/server/txReceipt'
import { tagAtomAsEntry } from '@/server/appTags'

// Create a public client for reading chain data
const chain = serverEnv.ENVIRONMENT === 'production' ? base : baseSepolia
const publicClient = createPublicClient({
  chain,
  transport: http()
})

// Polling configuration
const POLL_INTERVAL = 2000 // 2 seconds
const MAX_ATTEMPTS = 10 // 20 seconds total

async function waitForAtomIndexing(atomId: bigint, baseUrl: string): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const atom = await fetch(`${baseUrl}/api/entries/${atomId}`)
    if (atom.ok) return

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
  }
  throw new Error('Atom not indexed within timeout period')
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const hash = data.hash as `0x${string}`

    if (!hash?.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 })
    }

    console.log('Waiting for receipt...')
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('Receipt:', receipt)

    if (!receipt.logs[0]) {
      throw new Error('No logs found in receipt')
    }

    // Extract atom ID from logs
    const atomId = extractAtomIdFromReceipt(receipt)
    if (!atomId) {
      throw new Error('Failed to extract atom ID from receipt')
    }

    // Tag the atom as an entry
    await tagAtomAsEntry(atomId)
    console.log('Tagged atom as entry')

    // Get base URL from request URL
    const baseUrl = new URL(request.url).origin

    // Wait for graphql indexer to catch up
    await waitForAtomIndexing(atomId, baseUrl)

    return NextResponse.json({
      status: 'success',
      id: atomId.toString()
    })
  } catch (error) {
    console.error('Failed to confirm entry:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to confirm entry'
    }, { status: 400 })
  }
} 