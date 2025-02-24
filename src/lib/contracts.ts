import { parseAbi } from 'viem'

export const MULTIVAULT_ABI = parseAbi([
  'function createAtom(bytes atomUri) payable returns (uint256)',
  'function createTriple(uint256 subjectId, uint256 predicateId, uint256 objectId) payable returns (uint256)',
  'function getAtomCost() view returns (uint256)',
  'function getTripleCost() view returns (uint256)',
  'function atomsByHash(bytes32) view returns (uint256)',
  'function depositAtom(address receiver, uint256 id) payable returns (uint256)',
  'function previewDeposit(uint256 assets, uint256 id) view returns (uint256)',
  'function previewRedeem(uint256 shares, uint256 id) view returns (uint256)',
  'function currentSharePrice(uint256 id) view returns (uint256)',
  'function getVaultStateForUser(uint256 vaultId, address receiver) view returns (uint256, uint256)',
  'function redeemAtom(uint256 shares, address receiver, uint256 id) returns (uint256)',
  'function vaults(uint256) view returns (uint256 totalAssets, uint256 totalShares)',
  'function approveSender(address sender)'
])