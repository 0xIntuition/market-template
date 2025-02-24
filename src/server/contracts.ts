import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { serverEnv } from '@/lib/env'
import { MULTIVAULT_ABI } from '../lib/contracts'
import { base, baseSepolia } from 'viem/chains'
import { extractAtomIdFromReceipt, extractTripleIdFromReceipt } from './txReceipt'

// Clients need a viem chain, pick the right one based on the env
const chain = serverEnv.ENVIRONMENT === 'production' ? base : baseSepolia

// Initialize clients
const account = privateKeyToAccount(serverEnv.PRIVATE_KEY as `0x${string}`)

export const publicClient = createPublicClient({
  chain: chain,
  transport: http()
})

export const walletClient = createWalletClient({
  account,
  chain: chain,
  transport: http()
})

// Convenience
function hex(value: string | undefined): `0x${string}` {
  return value as `0x${string}`
}

// Repeatedly used
const multiVaultAddress = hex(serverEnv.MULTIVAULT_ADDRESS)

// WRITES:

// Contract interactions
// Internal, use EthMultiVault directly

// Creates an atom using the server wallet, returning the newly created atom ID after confirming the TX
// Used mainly to create app atoms for tagging data.  Recommended to use minimum `value`
export async function createAtom(atomUri: `0x${string}`, value: bigint) {
  // Generate Create Atom Request
  const { request } = await publicClient.simulateContract({
    address: multiVaultAddress,
    abi: MULTIVAULT_ABI,
    functionName: 'createAtom',
    args: [atomUri],
    value
  })

  // Make the call, get receipt and extract atom ID from the event data
  const hash = await walletClient.writeContract(request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  return extractAtomIdFromReceipt(receipt)

}

// Internal method for creating triples, typically used for tagging app data
// Uses internal server wallet
export async function createTriple(
  subjectId: bigint,
  predicateId: bigint,
  objectId: bigint,
  value: bigint
) {
  const { request } = await publicClient.simulateContract({
    address: multiVaultAddress,
    abi: MULTIVAULT_ABI,
    functionName: 'createTriple',
    args: [subjectId, predicateId, objectId],
    value
  })

  const hash = await walletClient.writeContract(request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  return extractTripleIdFromReceipt(receipt)
}

// READS:

// Contract costs
export async function getAtomCost(): Promise<bigint> {
  return publicClient.readContract({
    address: multiVaultAddress,
    abi: MULTIVAULT_ABI,
    functionName: 'getAtomCost'
  })
}

export async function getTripleCost(): Promise<bigint> {
  return publicClient.readContract({
    address: multiVaultAddress,
    abi: MULTIVAULT_ABI,
    functionName: 'getTripleCost'
  })
}

// Vault state functions
export async function getVaultState(atomId: bigint, address: string) {
  const [shares, assets] = await publicClient.readContract({
    address: multiVaultAddress,
    abi: MULTIVAULT_ABI,
    functionName: 'getVaultStateForUser',
    args: [atomId, address as `0x${string}`]
  })
  return { shares, assets }
}

export async function getVaultTotals(atomId: bigint) {
  const [totalAssets, totalShares] = await publicClient.readContract({
    address: multiVaultAddress,
    abi: MULTIVAULT_ABI,
    functionName: 'vaults',
    args: [atomId]
  })
  return { totalAssets, totalShares }
}

export async function getCurrentSharePrice(atomId: bigint) {
  return publicClient.readContract({
    address: multiVaultAddress,
    abi: MULTIVAULT_ABI,
    functionName: 'currentSharePrice',
    args: [atomId]
  })
}
