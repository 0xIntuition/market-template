import { getAppEntry } from '@/server/entries'
import { notFound } from 'next/navigation'
import AppEntryDisplay from '@/app/entry/app/AppEntryDisplay'

export default async function AppEntryPage() {
  // Await params before using its properties

  const entry = await getAppEntry()

  if (!entry) {
    notFound()
  }

  return <AppEntryDisplay entry={{ ...entry }} />
}
