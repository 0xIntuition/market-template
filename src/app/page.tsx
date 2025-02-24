import { getEntries } from '@/server/entries'
import { EntryFeed } from '@/components/EntryFeed'
import type { EntryListType } from '@/server/entries'

export default async function Page({ searchParams }: { searchParams?: { type?: EntryListType } }) {
  const type = (await searchParams)?.type || 'RECENT'

  const initialEntries = await getEntries(
    0, // offset
    10, // limit
    type
  )

  return <EntryFeed initialEntries={initialEntries} />
}
