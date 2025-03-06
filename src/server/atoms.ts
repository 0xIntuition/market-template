import { stringToHex } from 'viem'
import { pinThing, queryAtomBySchemaValues } from '@/server/graphql'
import { createAtom as createAtomContract, getAtomCost } from '@/server/contracts'
import type { PinThingInput } from '@/server/graphql'

export interface CreateAtomInput {
  name: string
  description: string
  image: string
  url: string
}

// Used by the server to create atoms - returns newly created Atom ID
// Use this in situations where the atom cannot exist yet
export async function createAtom(input: CreateAtomInput): Promise<bigint> {
  // 1. Pin content to IPFS
  const metadata: PinThingInput = {
    name: input.name,
    description: input.description,
    image: input.image,
    url: input.url
  }

  const pinResult = await pinThing(metadata)
  const uriBytes = stringToHex(pinResult.pinThing.uri)
  // 2. Get atom cost
  const atomCost = await getAtomCost()

  // 3. Create atom via contract
  return await createAtomContract(uriBytes, atomCost)
}

// Used by the server to find an atom with specific metadata, or create it if it doesn't exist yet.
// Typically used to get atom IDs for internal atom types, such as those used to tag & organize app data
export async function findOrCreateAtom(input: CreateAtomInput): Promise<bigint> {

  // 1. Try to find existing atom
  // TODO: write queryAtomByURI and hashAtomURI to ensure uniqueness
  const existingId = await queryAtomBySchemaValues(input.name, input.description, input.image, input.url)

  if (existingId) {
    return existingId
  }

  // 2. Create new atom if not found
  return createAtom(input)
}

export interface GetAtomInput {
  id: string
}