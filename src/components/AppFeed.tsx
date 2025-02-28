'use client'

import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Switch } from '@0xintuition/1ui'
import { AppCard, AppData } from './AppCard'
import { TagFilter } from './TagFilter'
import { useState, useMemo, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SortOption } from '@/server/graphql'

// Define the type for the data coming from the API
export interface AtomData {
  id: string
  vault_id: string
  label: string
  wallet_id: string
  image: string | null
  type: string
  block_timestamp: string
  data: string
  creator: {
    id: string
  }
  value: {
    thing: {
      name?: string
      description?: string
      url?: string
    } | null
  }
  vault: {
    position_count: number
    verifiedPosition: Array<{
      shares: string
      account_id: string
    }> | null
  }
  tags: {
    nodes: Array<{
      object: {
        label: string
        vault_id: string
      }
    }>
    aggregate: {
      count: number
    }
  }
}

interface AppFeedProps {
  apps: AtomData[]
  initialSortBy?: SortOption
  verificationAddress?: string
}

export default function AppFeed({ apps, initialSortBy = 'likes', verificationAddress }: AppFeedProps) {
  // Use search params for state persistence
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get sort from URL
  const sortFromUrl = (searchParams.get('sort') as SortOption) || initialSortBy

  // Handle tags
  const tagsFromParams = searchParams.get('tags')
  const filtersFromUrl = tagsFromParams?.split(',') || ['ALL']

  // Handle verified flag (default to true if not specified)
  const verifiedFromParams = searchParams.has('verified') ? searchParams.get('verified') === 'true' : true

  // Handle search query
  const queryFromParams = searchParams.get('q') || ''

  const [selectedFilters, setSelectedFilters] = useState<string[]>(filtersFromUrl)
  const [sortBy, setSortBy] = useState<SortOption>(sortFromUrl)
  const [searchQuery, setSearchQuery] = useState<string>(queryFromParams)
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(verifiedFromParams)

  // Update URL when filters or sort changes
  useEffect(() => {
    const params = new URLSearchParams()

    if (sortBy !== 'likes') {
      params.set('sort', sortBy)
    }

    if (selectedFilters.length > 0 && !(selectedFilters.length === 1 && selectedFilters[0] === 'ALL')) {
      params.set('tags', selectedFilters.join(','))
    }

    if (searchQuery) {
      params.set('q', searchQuery)
    }

    // Always include verified parameter in URL, even when true (default)
    params.set('verified', verifiedOnly.toString())

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.push(newUrl, { scroll: false })
  }, [sortBy, selectedFilters, searchQuery, verifiedOnly, router])

  // Transform incoming data to the format expected by AppCard
  const transformedApps = useMemo(() => {
    return apps.map((app): AppData => {
      // Extract unique tag labels
      const tagLabels = Array.from(new Set(app.tags.nodes.map((node) => node.object.label)))

      // Format the date from timestamp
      const timestamp = parseInt(app.block_timestamp) * 1000
      const date = new Date(timestamp)
      const formattedDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })

      // Generate a consistent background color based on the app ID
      const hashCode = (str: string) => {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i)
          hash |= 0 // Convert to 32bit integer
        }
        return hash
      }

      const hash = Math.abs(hashCode(app.id))
      const hue = hash % 360
      const logoBg = app.image ? 'transparent' : `hsl(${hue}, 80%, 40%)`

      // Use image from API or generate a logo placeholder based on the first letter
      const firstLetter = (app.value?.thing?.name || app.label || 'A').charAt(0).toUpperCase()
      const logo = app.image ? (
        <img src={app.image} alt={app.label} className="w-full h-full object-contain" />
      ) : (
        <div className="text-white font-bold">{firstLetter}</div>
      )

      // Check if app is verified
      const isVerified = app.vault.verifiedPosition && app.vault.verifiedPosition.length > 0

      return {
        id: parseInt(app.id),
        label: app.value?.thing?.name || app.label || '',
        url: app.value?.thing?.url || '',
        description: app.value?.thing?.description || '',
        created: formattedDate,
        timestamp: timestamp, // Store raw timestamp for accurate sorting
        positions: app.vault.position_count,
        liked: false, // TODO
        tags: tagLabels,
        logoBg,
        logo,
        verified: isVerified ?? false,
      }
    })
  }, [apps])

  // Extract unique tags from all apps for filtering
  const allTags = useMemo(() => {
    const tags = new Set(['ALL'])
    transformedApps.forEach((app) => {
      app.tags.forEach((tag) => tags.add(tag.toUpperCase()))
    })
    return Array.from(tags)
  }, [transformedApps])

  // Filter apps based on selected tags and search query
  const filteredApps = useMemo(() => {
    // First filter the apps
    const filtered = transformedApps.filter((app) => {
      // Tag filtering
      const passesTagFilter =
        selectedFilters.includes('ALL') ||
        app.tags.some((tag) => selectedFilters.some((filter) => filter.toLowerCase() === tag.toLowerCase()))

      // Search query filtering
      const passesSearchFilter =
        !searchQuery ||
        app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Verified filtering
      const passesVerifiedFilter = !verifiedOnly || app.verified

      return passesTagFilter && passesSearchFilter && passesVerifiedFilter
    })

    // Then apply client-side sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        // Sort by timestamp (newest first)
        return b.timestamp - a.timestamp
      } else if (sortBy === 'oldest') {
        // Sort by timestamp (oldest first)
        return a.timestamp - b.timestamp
      } else {
        // Default sort by likes/positions
        return b.positions - a.positions
      }
    })
  }, [transformedApps, selectedFilters, searchQuery, verifiedOnly, sortBy])

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle verified toggle changes
  const handleVerifiedChange = (checked: boolean) => {
    setVerifiedOnly(checked)
  }

  return (
    <div className="w-full flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <TagFilter
            filters={allTags}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            className="w-full"
          />

          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 w-full sm:w-auto sm:ml-auto">
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Search"
                className="bg-transparent border-primary/30 rounded-full w-full sm:h-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex items-center gap-2 self-center sm:self-auto">
              <span className="text-sm text-primary/70 whitespace-nowrap">Sort by</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="bg-transparent border border-white/20 hover:bg-white/5 transition-colors px-2 rounded-md">
                  <SelectValue placeholder="Most Liked" className="text-sm font-normal" />
                  <ChevronDown className="h-4 w-4 text-white/60 ml-1" />
                </SelectTrigger>
                <SelectContent
                  className="bg-background backdrop-blur-sm border border-white/20 text-white rounded-md shadow-lg animate-in fade-in-0 zoom-in-95 min-w-[144px] sm:min-w-[160px]"
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem value="likes" className="text-sm hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    Most Liked
                  </SelectItem>
                  <SelectItem value="newest" className="text-sm hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    Newest
                  </SelectItem>
                  <SelectItem value="oldest" className="text-sm hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    Oldest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={handleVerifiedChange} />
          <label htmlFor="verified-only" className="text-sm text-primary/70 cursor-pointer">
            Verified Only
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => <AppCard key={app.id} app={app} />)
        ) : (
          <div className="col-span-3 text-center py-8 text-primary/70">
            No apps found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  )
}
