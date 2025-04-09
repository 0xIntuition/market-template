'use client'

import Link from 'next/link'
import { Button, Text } from '@0xintuition/1ui'
import type { Entry } from '@/types'
import { EntryCard } from '@/components/EntryCard'
import { Header } from '@/components/Header'

interface EntryDisplayProps {
  entry: Entry | null
}

export default function AppEntryDisplay({ entry }: EntryDisplayProps) {
  if (!entry) {
    return <div>Entry not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />

      <div className="mb-8 py-4">
        <Link href="/">
          <Button variant="secondary">← Back to Feed</Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Main Entry Card */}
        <EntryCard entry={entry} showShare={true} truncate={false} />

        {/* Create Section */}
        <div className="space-y-4">
          <Text variant="body">Stake on the app itself for great justice!</Text>
        </div>
      </div>
    </div>
  )
}
