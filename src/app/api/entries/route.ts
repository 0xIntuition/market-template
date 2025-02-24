import { NextResponse } from 'next/server'
import { getEntries } from '@/server/entries'
import type { EntryListType } from '@/server/entries'
import { pinThing } from '@/server/graphql'
import { getAtomCost } from '@/server/contracts'
import type { PinThingInput } from '@/server/graphql'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = parseInt(searchParams.get('limit') || '10')
  const type = (searchParams.get('type') as EntryListType) || 'RECENT'

  try {
    const entries = await getEntries(offset, limit, type)
    return NextResponse.json(entries, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch entries:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate input
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Prepare metadata for IPFS
    const metadata: PinThingInput = {
      name: data.name.trim(),
      description: data.description?.trim() || '',
      image: data.image?.trim() || '',
      url: data.url?.trim() || ''
    }

    // Pin content to IPFS
    const pinResult = await pinThing(metadata)
    const uri = pinResult.pinThing.uri

    // Get atom cost
    const cost = await getAtomCost()

    return NextResponse.json({ uri, cost: cost.toString() }, { status: 200 })
  } catch (error) {
    console.error('Failed to prepare entry:', error)
    return NextResponse.json({ error: 'Failed to prepare entry' }, { status: 500 })
  }
} 