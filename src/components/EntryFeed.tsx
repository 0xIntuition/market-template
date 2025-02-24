'use client'

import {
  Button,
  Text,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  SegmentedControl,
  SegmentedControlItem,
} from '@0xintuition/1ui'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { EntryCard } from '@/components/EntryCard'
import { Entry } from '@/types'
import type { EntryListType } from '@/server/entries'
import debounce from 'lodash/debounce'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { SearchResult } from '@/server/search'
import { Header } from '@/components/Header'

type EntryStats = {
  userState: {
    shares: string
    assets: string
  }
  vaultTotals: {
    totalShares: string
    totalAssets: string
  }
  sharePrice: string
}

interface EntryFeedProps {
  initialEntries: Entry[]
}

export function EntryFeed({ initialEntries }: EntryFeedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { primaryWallet } = useDynamicContext()
  const [entries, setEntries] = useState<(Entry & { stats?: EntryStats })[]>(initialEntries)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const currentType = (searchParams?.get('type') as EntryListType) || 'RECENT'

  const filterOptions = [
    { value: 'TRENDING', label: 'Trending' },
    { value: 'RECENT', label: 'Latest' },
    { value: 'TOP', label: 'Top' },
  ]

  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q.trim()) {
          setSearchResults([])
          // setIsSearching(false)
          return
        }

        // setIsSearching(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
          if (!response.ok) throw new Error('Search failed')
          const results = await response.json()
          setSearchResults(results)
        } catch (err) {
          console.error('Search error:', err)
          setError(err instanceof Error ? err.message : 'Search failed')
        } finally {
          // setIsSearching(false)
        }
      }, 100),
    []
  )

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
    } else {
      setSearchResults([])
      debouncedSearch.cancel()
    }
    return () => debouncedSearch.cancel()
  }, [searchQuery, debouncedSearch])

  const handleFilterChange = async (type: EntryListType) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('type', type)
    router.push(`/?${params.toString()}`)

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/entries?type=${type}`)
      if (!response.ok) throw new Error('Failed to fetch entries')
      const entries = await response.json()

      // Only fetch stats if user is connected
      if (primaryWallet?.address) {
        const entriesWithStats = await Promise.all(
          entries.map(async (entry: Entry) => {
            try {
              const statsResponse = await fetch(
                `/api/atom-stats?atomId=${entry.id}&userAddress=${primaryWallet.address}`
              )
              if (!statsResponse.ok) throw new Error('Failed to fetch atom stats')
              const stats = await statsResponse.json()
              return { ...entry, stats }
            } catch (err) {
              console.error(`Failed to fetch stats for entry ${entry.id}:`, err)
              return entry
            }
          })
        )
        setEntries(entriesWithStats)
      } else {
        setEntries(entries)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />

      {/* Authentication and Search Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Text variant="body"></Text>
            <Link href="/entry/new">
              <Button variant="primary">Create New Entry</Button>
            </Link>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          <div>
            <style jsx global>{`
              [cmdk-item][aria-selected='true'] {
                background: rgb(31 41 55) !important;
                color: rgb(255 255 255) !important;
              }
            `}</style>
            <Command className="rounded-lg border shadow-sm" shouldFilter={false}>
              <CommandInput placeholder="Search entries..." value={searchQuery} onValueChange={setSearchQuery} />
              <CommandList>
                <CommandGroup>
                  {searchResults.map((entry) => (
                    <CommandItem
                      key={entry.id}
                      value={entry.id}
                      onSelect={() => {
                        router.push(`/entry/${entry.id}`)
                        setSearchQuery('')
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 flex-shrink-0 relative">
                          <Image
                            src={entry.image || '/placeholder.png'}
                            alt={entry.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <Text variant="body">{entry.name}</Text>
                          {entry.description && entry.description !== entry.name && (
                            <div className="flex items-center gap-2">
                              <Text variant="caption" className="text-gray-500 truncate max-w-[300px]">
                                {entry.description}
                              </Text>
                              <Text variant="caption" className="text-gray-500 whitespace-nowrap">
                                ·{' '}
                                {entry.vault?.total_shares
                                  ? `${Number(entry.vault.total_shares).toExponential(2)} shares`
                                  : 'No shares'}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      </div>

      {/* Entries Feed */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <Text variant="heading5">Markets</Text>
          <SegmentedControl>
            {filterOptions.map((option) => (
              <SegmentedControlItem
                key={option.value}
                isActive={currentType === option.value}
                onClick={() => handleFilterChange(option.value as EntryListType)}
              >
                {option.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <Text variant="body">Loading...</Text>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6">
            <Text variant="body" className="text-red-500">
              {error}
            </Text>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <Text variant="body">No entries yet. Be the first to create one!</Text>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/entry/${entry.id}`} className="block p-2">
                <EntryCard entry={entry} showShare={true} truncate={true} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
