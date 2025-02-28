'use client'

import { Button } from '@0xintuition/1ui'

interface TagFilterProps {
  filters?: string[]
  selectedFilters: string[]
  onFilterChange: (filters: string[]) => void
  className?: string
}

export function TagFilter({
  filters = ['ALL', 'WALLET', 'DEFI', 'CONSUMER', 'ONRAMP', 'INFRA'],
  selectedFilters,
  onFilterChange,
  className = '',
}: TagFilterProps) {
  const handleFilterClick = (filter: string) => {
    if (filter === 'ALL') {
      // If ALL is clicked, deselect everything else and select only ALL
      onFilterChange(['ALL'])
    } else {
      let newFilters: string[]

      if (selectedFilters.includes(filter)) {
        // If filter is already selected, remove it
        newFilters = selectedFilters.filter((f) => f !== filter)
        // If no filters left, select ALL
        if (newFilters.length === 0) {
          newFilters = ['ALL']
        }
      } else {
        // If filter is not selected, add it and remove ALL if present
        newFilters = selectedFilters.filter((f) => f !== 'ALL')
        newFilters.push(filter)
      }

      onFilterChange(newFilters)
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={selectedFilters.includes(filter) ? 'default' : 'outline'}
          className={`rounded-full ${
            selectedFilters.includes(filter)
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border-primary/20 hover:bg-primary/10'
          }`}
          onClick={() => handleFilterClick(filter)}
        >
          {filter}
        </Button>
      ))}
    </div>
  )
}
