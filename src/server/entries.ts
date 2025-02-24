import type { Entry } from '@/types'
import { client } from '@/server/graphql'
import { getTypeTagAtomIds } from '@/server/appTags'
import { getNumSubEntriesForEntry } from '@/server/subEntries'
import { getVaultTotals } from '@/server/contracts'

type GetEntriesResponse = {
  triples: Array<{
    subject: {
      id: string
      value: {
        thing: {
          name: string
          description: string
          image: string
          url: string
        }
      }
      creator_id: string
      block_timestamp: string
      signals_aggregate: {
        aggregate: {
          sum: {
            delta: number
          }
        }
      }
      subject_triples: Array<{
        id: string
      }>
    }
  }>
}

export type EntryListType = 'TRENDING' | 'RECENT' | 'TOP'

export async function getEntries(offset: number = 0, limit: number = 10, listType: EntryListType = 'RECENT'): Promise<Entry[]> {
  // These atom IDs are used to filter Intuition Data for the "Entry" type defined by this app.
  const { predicateId: isTypeTypeId, entryId: entryTypeId } = await getTypeTagAtomIds()

  // This query fetches all "Entry" type atoms from Intuition Data.
  const baseQuery = `
    query GetEntries($isTypeTypeId: numeric!, $entryTypeId: numeric!, $limit: Int!, $offset: Int!) {
      triples(
        where: {
          predicate_id: { _eq: $isTypeTypeId },
          object_id: { _eq: $entryTypeId }
        },
        limit: $limit,
        offset: $offset,
        order_by: ORDER_BY_PLACEHOLDER
      ) {
        subject {
          id
          value {
            thing {
              name
              description
              image
              url
            }
          }
          creator_id
          block_timestamp
          vault {
            total_shares
          }
        }
      }
    }
  `
  // Then we make sure the query sorts the results by timestamp (recent), timestamp+shares (trending) or shares (top)
  let query = baseQuery;
  if (listType === 'RECENT') {
    query = baseQuery.replace('ORDER_BY_PLACEHOLDER', '[{ block_timestamp: desc }]')
  } else if (listType === 'TRENDING') {
    query = baseQuery.replace('ORDER_BY_PLACEHOLDER', '[{ vault: { total_shares: desc } }, { block_timestamp: desc }]')
  } else if (listType === 'TOP') {
    query = baseQuery.replace('ORDER_BY_PLACEHOLDER', '[{ vault: { total_shares: desc } }]')
  }

  try {
    const result = await client.request<GetEntriesResponse>(query, {
      isTypeTypeId: isTypeTypeId.toString(),
      entryTypeId: entryTypeId.toString(),
      limit: limit,
      offset: offset
    })

    console.log("Got result with full data structure:", JSON.stringify(result, null, 2))

    const entriesWithAssets = await Promise.all(result.triples.map(async triple => {
      const atom = triple.subject
      const totals = await getVaultTotals(BigInt(atom.id))
      console.log("totals: ", totals)

      const numSubEntries = await getNumSubEntriesForEntry(atom.id)
      return {
        id: atom.id,
        name: atom.value.thing.name,
        description: atom.value.thing.description,
        image: atom.value.thing.image,
        url: atom.value.thing.url,
        totalAssets: totals.totalAssets.toString(),
        totalShares: totals.totalShares.toString(),
        createdAt: new Date(parseInt(atom.block_timestamp) * 1000).toISOString(),
        creator: atom.creator_id,
        numSubEntries: numSubEntries
      }
    }))
    return entriesWithAssets
  } catch (error) {
    console.error('Failed to fetch questions:', error)
    return []
  }
}

export async function getEntryById(id: string): Promise<Entry | null> {
  // Get the necessary atom IDs first
  const { predicateId: typePredicateId, entryId: entryTypeId } = await getTypeTagAtomIds()

  const query = `
    query GetEntry($id: numeric!, $typePredicateId: numeric!, $entryTypeId: numeric!) {
      atom(id: $id) {
        id
        value {
          thing {
            name
            description
            image
            url
          }
        }
        creator_id
        block_timestamp
      }
      triples(where: {
        subject_id: { _eq: $id },
        predicate_id: { _eq: $typePredicateId },
        object_id: { _eq: $entryTypeId }
      }) {
        id
      }
    }
  `

  try {
    const result = await client.request<{
      atom: {
        id: string
        value: {
          thing: {
            name: string
            description: string
            image: string
            url: string
          }
        }
        creator_id: string
        block_timestamp: string
        signals_aggregate: {
          aggregate: {
            sum: {
              delta: number
            }
          }
        }
      }
      triples: Array<{ id: string }>
    }>(query, {
      id: parseInt(id),
      typePredicateId: typePredicateId.toString(),
      entryTypeId: entryTypeId.toString()
    })

    if (!result.atom || result.triples.length === 0) return null

    const atom = result.atom

    const totals = await getVaultTotals(BigInt(atom.id))
    return {
      id: atom.id,
      name: atom.value.thing.name,
      description: atom.value.thing.description,
      image: atom.value.thing.image,
      url: atom.value.thing.url,
      totalAssets: totals.totalAssets.toString(),
      totalShares: totals.totalShares.toString(),
      createdAt: new Date(parseInt(atom.block_timestamp) * 1000).toISOString(),
      creator: atom.creator_id
    }
  } catch (error) {
    console.error('Failed to fetch entry:', error)
    return null
  }
}
