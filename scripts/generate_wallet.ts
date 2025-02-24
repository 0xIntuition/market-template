import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { mkdir, appendFile } from 'fs/promises'
import { join } from 'path'

async function main() {
  // Generate private key and account
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)

  // Format new entry
  const newEntry = `
# Wallet Entry
Generated: ${new Date().toISOString()}

## Private Key (Keep Secret!)
${privateKey}

## Public Address
${account.address}

---
`

  // Ensure output directory exists
  const outputDir = join(process.cwd(), 'scripts', 'output', 'generate_wallet')
  await mkdir(outputDir, { recursive: true })
  const outputPath = join(outputDir, 'keys.md')

  // Append to file, create if doesn't exist
  await appendFile(outputPath, newEntry)

  // Log success but not the actual keys
  console.log('Wallet generated successfully!')
  console.log(`Public address: ${account.address}`)
  console.log('Private key appended to scripts/output/generate_wallet/keys.md')
}

main().catch(console.error) 