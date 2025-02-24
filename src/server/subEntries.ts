import type { SubEntry } from '@/types'
import { client } from '@/server/graphql'
import { getIsSubEntryOfPredicateId } from '@/server/appTags'
import { getVaultTotals } from '@/server/contracts'

export async function getNumSubEntriesForEntry(entryId: string): Promise<number> {
  const predicateId = await getIsSubEntryOfPredicateId()

  const query = `
    query GetSubEntriesCount($predicateId: numeric!, $entryId: numeric!) {
      triples_aggregate(
        where: {
          predicate_id: { _eq: $predicateId },
          object_id: { _eq: $entryId }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `

  try {
    const result = await client.request<{
      triples_aggregate: {
        aggregate: {
          count: number
        }
      }
    }>(query, {
      predicateId: predicateId.toString(),
      entryId: parseInt(entryId)
    })

    return result.triples_aggregate.aggregate.count
  } catch (error) {
    console.error('Failed to fetch answer count:', error)
    return 0
  }
}

type GetSubEntriesResponse = {
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
    }
  }>
}

export async function getSubEntriesForEntry(entryId: bigint, limit: number = 10, offset: number = 0): Promise<SubEntry[]> {
  const predicateId = await getIsSubEntryOfPredicateId()


  const query = `
    query GetSubEntries($predicateId: numeric!, $entryId: numeric!, $limit: Int!, $offset: Int!) {
      triples(
        where: {
          predicate_id: { _eq: $predicateId },
          object_id: { _eq: $entryId }
        },
        limit: $limit,
        offset: $offset,
        order_by: [{ subject: { vault: { total_shares: desc } } }]
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

  try {
    const result = await client.request<GetSubEntriesResponse>(query, {
      predicateId: predicateId.toString(),
      entryId: entryId.toString(),
      limit,
      offset
    })

    console.log("Got sub-entries result", result)

    const subEntries = await Promise.all(result.triples.map(async triple => {
      const atom = triple.subject
      if (!atom.value?.thing) {
        console.log("Invalid atom", atom)
        return null
      }

      const totals = await getVaultTotals(BigInt(atom.id))
      const subEntry: SubEntry = {
        id: atom.id,
        entryId: entryId.toString(), // Sub entry is associated with input entry ID
        name: atom.value.thing.name,
        description: atom.value.thing.description,
        image: atom.value.thing.image,
        url: atom.value.thing.url,
        totalShares: totals.totalShares.toString(),
        totalAssets: totals.totalAssets.toString(),
        createdAt: new Date(parseInt(atom.block_timestamp) * 1000).toISOString(),
        creator: atom.creator_id
      }

      return subEntry
    }))
    return subEntries.filter((subEntry): subEntry is SubEntry => subEntry !== null)
  } catch (error) {
    console.error('Failed to fetch sub-entries:', error)
    return []
  }
}

// Note: think about optimizing this.  We should only ever get a question ID or answer ID once it's created in our app
// So we should be able to display it before our tag is confirmed and we are able to filter.
// Just to make the experience faster and more fluid.
export async function getSubEntryById(id: string): Promise<SubEntry | null> {
  const query = `
    query GetSubEntry($id: numeric!) {
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
        vault {
          total_shares
        }
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
        vault: {
          total_shares: string
        }
      }
    }>(query, { id: parseInt(id) })

    if (!result.atom?.value?.thing) return null

    const totals = await getVaultTotals(BigInt(result.atom.id))

    return {
      id: result.atom.id,
      entryId: '', // We need an additional query to find this via triple relationships 
      name: result.atom.value.thing.name,
      description: result.atom.value.thing.description,
      image: result.atom.value.thing.image,
      url: result.atom.value.thing.url,
      totalShares: totals.totalShares.toString(),
      totalAssets: totals.totalAssets.toString(),
      createdAt: new Date(parseInt(result.atom.block_timestamp) * 1000).toISOString(),
      creator: result.atom.creator_id
    }
  } catch (error) {
    console.error('Failed to fetch answer:', error)
    return null
  }
}
