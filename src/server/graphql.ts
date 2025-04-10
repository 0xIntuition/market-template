import { createServerClient, configureClient } from '@0xintuition/graphql'
import { serverEnv } from '@/lib/env'

// API endpoints
const API_URL_PROD = 'https://intuition-api.com/v1/graphql' // Base 1.5 backend not deployed yet
const API_URL_DEV = 'https://prod.base-sepolia-v-1-5.intuition-api.com/v1/graphql'

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
  image: string
  url: string
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
    term_id: string
  }>
}

export const queryAtomBySchemaValues = async (name: string, description: string, image: string, url: string): Promise<bigint | null> => {
  try {
    const result = await client.request<QueryAtomByNameResponse>(`
      query FindAtom($name: String!, $description: String!, $image: String!, $url: String!) {
        atoms(where: {
          atom_value: {
            thing: {
              name: { _eq: $name },
              description: { _eq: $description },
              image: { _eq: $image },
              url: { _eq: $url }
            }
          }
        }) {
          term_id
        }
      }
    `, { name, description, image, url })
    if (result.atoms.length > 0) {
      return BigInt(result.atoms[0].term_id)
    }
    return null
  } catch (error) {
    console.error('Failed to query atom by schema values:', error)
    throw error
  }
}