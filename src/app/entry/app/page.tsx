export const dynamic = 'force-dynamic'

import { getAppEntry } from '@/server/entries'
import AppEntryDisplay from '@/app/entry/app/AppEntryDisplay'
import { Suspense } from 'react'

export default async function AppEntryPage() {
  const entry = await getAppEntry()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppEntryDisplay entry={entry} />
    </Suspense>
  )
}
