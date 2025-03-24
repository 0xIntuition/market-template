export const dynamic = 'force-dynamic'

import { getAppEntry } from '@/server/entries'
import AppEntryDisplay from '@/app/entry/app/AppEntryDisplay'
import { Suspense } from 'react'

export default function AppEntryPage() {
  // Await params before using its properties

  const entry = getAppEntry()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppEntryDisplay entry={{ ...entry }} />
    </Suspense>
  )
}
