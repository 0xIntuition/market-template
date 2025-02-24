import { getEntryById } from '@/server/entries'
import { getNumSubEntriesForEntry, getSubEntriesForEntry } from '@/server/subEntries'
import { notFound } from 'next/navigation'
import EntryDisplay from '@/app/entry/[id]/EntryDisplay'

interface EntryPageProps {
  params: {
    id: string
  }
}

export default async function EntryPage({ params }: EntryPageProps) {
  // Await params before using its properties
  const { id } = await params

  const entry = await getEntryById(id)

  if (!entry) {
    notFound()
  }

  // Get subentries count and data
  const numSubEntries = await getNumSubEntriesForEntry(id)
  const subEntries = await getSubEntriesForEntry(BigInt(id), 10, 0)

  return <EntryDisplay entry={{ ...entry, numSubEntries, subEntries }} />
}
