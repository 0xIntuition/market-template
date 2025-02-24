import { formatEther } from 'viem'

export function formatValue(value: bigint, isShares: boolean = false, raw: boolean = false): string {
  if (value === 0n) return '0'

  if (isShares && raw) {
    return value.toString()
  }

  const num = isShares ? Number(value) : Number(formatEther(value))

  if (isShares) {
    const exp = num.toExponential(2)
    return exp.endsWith('e+0') ? exp.slice(0, -3) : exp
  } else {
    return num.toFixed(4)
  }
}