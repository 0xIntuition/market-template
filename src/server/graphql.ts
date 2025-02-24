import { createServerClient, configureClient } from '@0xintuition/graphql'
import { serverEnv } from '@/lib/env'

// API endpoints
const API_URL_PROD = 'https://intuition-api.com/v1/graphql'
const API_URL_DEV = 'https://prod.base-sepolia.intuition-api.com/v1/graphql'

// Configure GraphQL client based on environment
configureClient({
  apiUrl: serverEnv.ENVIRONMENT === 'development' ? API_URL_DEV : API_URL_PROD
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