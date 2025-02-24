import { createTriple as createTripleContract, getTripleCost } from '@/server/contracts'

export interface CreateTripleInput {
  subjectId: bigint
  predicateId: bigint
  objectId: bigint
}

// Creates a new triple -- used by server wallet to organize app data
export async function createTriple(input: CreateTripleInput): Promise<bigint> {
  // 1. Get triple cost
  const tripleCost = await getTripleCost()

  // 2. Create triple via contract
  return await createTripleContract(
    input.subjectId,
    input.predicateId,
    input.objectId,
    tripleCost,
  )
}
