import { type TransactionReceipt, parseEventLogs } from 'viem'

const atomCreatedAbi = [{
  type: 'event',
  name: 'AtomCreated',
  inputs: [
    { type: 'address', name: 'creator', indexed: true },
    { type: 'address', name: 'atomWallet', indexed: true },
    { type: 'bytes', name: 'atomData' },
    { type: 'uint256', name: 'vaultID' }
  ]
}] as const

const tripleCreatedAbi = [{
  type: 'event',
  name: 'TripleCreated',
  inputs: [
    { type: 'address', name: 'creator', indexed: true },
    { type: 'uint256', name: 'subjectId' },
    { type: 'uint256', name: 'predicateId' },
    { type: 'uint256', name: 'objectId' },
    { type: 'uint256', name: 'vaultID' }, // TODO: Make ID -> Id in contract event!
  ]
}] as const

// Gets the atom ID that was created by a user given the TX Receipt
export function extractAtomIdFromReceipt(receipt: TransactionReceipt): bigint {
  const events = parseEventLogs({
    logs: receipt.logs,
    abi: atomCreatedAbi,
    eventName: 'AtomCreated'
  })

  if (events.length === 0) {
    throw new Error('No AtomCreated events found in receipt')
  }

  const termId = (events[0].args as { vaultID: bigint }).vaultID

  if (typeof termId !== 'bigint') {
    throw new Error('Invalid vaultID type in event arguments')
  }

  return termId
}

export function extractTripleIdFromReceipt(receipt: TransactionReceipt): bigint {
  const events = parseEventLogs({
    logs: receipt.logs,
    abi: tripleCreatedAbi,
    eventName: 'TripleCreated'
  })

  if (events.length === 0) {
    throw new Error('No TripleCreated events found in receipt')
  }

  const termId = (events[0].args as { vaultID: bigint }).vaultID

  if (typeof termId !== 'bigint') {
    throw new Error('Invalid vaultID type in event arguments')
  }

  return termId
} 
