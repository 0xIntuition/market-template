import { NextResponse } from 'next/server'
import { getEntryById } from '@/server/entries'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await getEntryById(params.id)

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Failed to fetch entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    )
  }
} 