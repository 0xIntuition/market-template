import { createServerClient, configureClient } from '@0xintuition/graphql'
import { serverEnv } from '@/lib/env'

// API endpoints
const API_URL_PROD = 'https://prod.base.intuition-api.com/v1/graphql'
const API_URL_DEV = 'https://prod.base-sepolia.intuition-api.com/v1/graphql'

// Configure GraphQL client based on environment
configureClient({
  apiUrl: serverEnv.ENVIRONMENT === 'development' ? API_URL_DEV : API_URL_DEV
})

// Initialize the GraphQL client
export const client = createServerClient({})

// Pin a thing to IPFS
export type PinThingInput = {
  name: string
  description: string
  image?: string
  url?: string
}

export type PinThingResponse = {
  pinThing: {
    uri: string
  }
}

export const pinThing = async (thing: PinThingInput) => {
  try {
    const result = await client.request<PinThingResponse>(`
      mutation PinThing($thing: PinThingInput!) {
        pinThing(thing: $thing) {
          uri
        }
      }
    `, { thing })
    return result
  } catch (error) {
    console.error('Failed to pin thing:', error)
    throw error
  }
}

// Query atoms by name
export type QueryAtomByNameResponse = {
  atoms: Array<{
    vault_id: string
  }>
}

export const queryAtomByName = async (name: string): Promise<bigint | null> => {
  try {
    const result = await client.request<QueryAtomByNameResponse>(`
      query FindAtom($name: String!) {
        atoms(where: {
          value: {
            thing: {
              name: { _eq: $name }
            }
          }
        }) {
          vault_id
        }
      }
    `, { name })
    if (result.atoms.length > 0) {
      return BigInt(result.atoms[0].vault_id)
    }
    return null
  } catch (error) {
    console.error('Failed to query atom by name:', error)
    throw error
  }
}

export type SortOption = 'newest' | 'oldest' | 'likes';

export type GetAppsResponse = {
  atoms: Array<{
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
      // TODO: Add filtering and sorting by TVL instead of number of positions
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
  }>
}
export const getApps = async (sortBy: SortOption = 'likes', verificationAddress?: string) => {

  const where = {
    "_and": [
      {
        "as_subject_triples": {
          "predicate_id": {
            "_eq": "3" // dev - has tag
          },
          "object_id": {
            "_eq": "16763" // dev - base
          }
        }
      }
    ]
  }

  // Configure order by based on sort preference
  const orderBy = sortBy === 'newest'
    ? { block_timestamp: 'desc' }
    : sortBy === 'oldest'
      ? { block_timestamp: 'asc' }
      : { vault: { position_count: 'desc' } }; // 'likes' is default

  try {
    const result = await client.request<GetAppsResponse>(`
      query Atom($where: atoms_bool_exp, $orderBy: [atoms_order_by!], $address: String) {
        atoms(where: $where, order_by: $orderBy) {
          id
          vault_id
          label
          wallet_id
          image
          type
          block_timestamp
          data
          creator {
            id
          }
          value {
            thing {
              name
              description
              url
            }
          }
          vault {
            position_count
            verifiedPosition: positions(
              limit: 1
              where: { account_id: { _eq: $address } }
            ) {
              shares
              account_id
            }
          }
          tags: as_subject_triples_aggregate(
            where: { predicate_id: { _eq: 3 } }
          ) {
            nodes {
              object {
                label
                vault_id
              }
            }
            aggregate {
              count
            }
          }
        }
      }
    `, { where, orderBy, address: verificationAddress })
    return result.atoms
  } catch (error) {
    console.error('Failed to get apps:', error)
    throw error
  }
}