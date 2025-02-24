import { createServerClient } from '@0xintuition/graphql'
import { getTypeTagAtomIds } from '@/server/appTags'

const client = createServerClient({})

const searchEntriesQuery = `
  query SearchEntries($searchStr: String!, $typePredicateId: numeric!, $entryOrSubEntryTypeId: numeric!) {
    atoms(
      where: {
        _or: [
          { data: { _ilike: $searchStr } },
          { label: { _ilike: $searchStr } },
          { value: { thing: { name: { _ilike: $searchStr } } } },
          { value: { thing: { description: { _ilike: $searchStr } } } }
        ],
        as_subject_triples: {
          predicate_id: { _eq: $typePredicateId },
          object_id: { _in: [$entryOrSubEntryTypeId] }
        }
      },
      limit: 5,
      order_by: { vault: { total_shares: desc } }
    ) {
      id
      data
      label
      type
      value {
        thing {
          name
          description
          image
          url
        }
      }
      as_subject_triples(where: { predicate_id: { _eq: $typePredicateId } }) {
        object_id
      }
      block_timestamp
      vault {
        total_shares
      }
    }
  }
`

interface AtomResult {
  id: number
  data: string
  label: string
  type: string
  value: {
    thing: {
      name: string
      description: string
      image: string
      url: string
    }
  }
  as_subject_triples: Array<{
    object_id: number
  }>
  block_timestamp: string
  vault: {
    total_shares: string
  }
}

interface SearchResponse {
  atoms: AtomResult[]
}

export interface SearchResult {
  id: string
  name: string
  description: string
  image: string
  url: string
  vault: {
    total_shares: string
  }
}

async function searchTerm(searchStr: string, typePredicateId: string, entryTypeId: string): Promise<SearchResult[]> {
  const formattedStr = `%${searchStr}%`

  const result = await client.request<SearchResponse>(searchEntriesQuery, {
    searchStr: formattedStr,
    typePredicateId: typePredicateId,
    entryOrSubEntryTypeId: entryTypeId
  })

  return result.atoms.map((atom) => ({
    id: atom.id.toString(),
    name: atom.value.thing.name,
    description: atom.value.thing.description || atom.data || '',
    image: atom.value.thing.image,
    url: atom.value.thing.url,
    vault: atom.vault
  }))
}

export async function searchEntries(searchStr: string): Promise<SearchResult[]> {
  const { predicateId: typePredicateId, entryId: entryTypeId } = await getTypeTagAtomIds()

  // create an array of all terms in searchStr
  const terms = searchStr.split(' ').filter(term => term.length > 0)

  // Search for each term
  const termResults = await Promise.all(
    terms.map(term => searchTerm(term, typePredicateId.toString(), entryTypeId.toString()))
  )

  // Count frequency of each result across all term searches
  const frequencyMap = new Map<string, { result: SearchResult; count: number }>()

  termResults.flat().forEach(result => {
    const existing = frequencyMap.get(result.id)
    if (existing) {
      existing.count++
    } else {
      frequencyMap.set(result.id, { result, count: 1 })
    }
  })

  // Sort by frequency (desc) and then by vault total_shares (desc)
  // Ignore results that didn't show up for all terms
  const results = Array.from(frequencyMap.values())
    .filter(item => item.count >= terms.length)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return Number(b.result.vault.total_shares) - Number(a.result.vault.total_shares)
    })
    .map(item => item.result)

  // Return up to 5 so the user doesn't feel like they are DDoSing the system
  return results.slice(0, 5)
} 
