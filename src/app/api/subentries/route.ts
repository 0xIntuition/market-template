import { NextResponse } from 'next/server'
import { getSubEntriesForEntry } from '@/server/subEntries'
import { pinThing } from '@/server/graphql'
import { getAtomCost } from '@/server/contracts'
import type { PinThingInput } from '@/server/graphql'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entryId = searchParams.get('entryId')
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!entryId) {
    return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
  }

  try {
    const subEntries = await getSubEntriesForEntry(BigInt(entryId), limit, offset)
    return NextResponse.json(subEntries, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch subentries:', error)
    return NextResponse.json({ error: 'Failed to fetch subentries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate input
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!data.entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
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
    console.error('Failed to prepare sub-entry:', error)
    return NextResponse.json({ error: 'Failed to prepare sub-entry' }, { status: 500 })
  }
} 