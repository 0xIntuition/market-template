'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Text, Card, Input, Textarea } from '@0xintuition/1ui'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { stringToHex, encodeFunctionData, keccak256 } from 'viem'
import { clientEnv } from '@/lib/env'
import { MULTIVAULT_ABI } from '@/lib/contracts'
import { Header } from '@/components/Header'

export function NewEntryForm() {
  const router = useRouter()
  const { primaryWallet } = useDynamicContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    url: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreateEntry(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!primaryWallet) {
      setError('Please connect your wallet first')
      return
    } else if (!isEthereumWallet(primaryWallet)) {
      setError('Please connect an Ethereum wallet')
      return
    }

    const { name } = formData
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the entry data
      const entryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        url: formData.url.trim(),
      }

      // 1. Prepare entry (pin to IPFS and get cost)
      const prepareResponse = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      })

      if (!prepareResponse.ok) {
        throw new Error('Failed to prepare entry')
      }

      const { uri, cost } = await prepareResponse.json()

      const walletClient = await primaryWallet.getWalletClient()
      const publicClient = await primaryWallet.getPublicClient()

      // Check if atom already exists
      const atomHash = keccak256(stringToHex(uri))
      const existingAtomId = await publicClient.readContract({
        address: clientEnv.MULTIVAULT_ADDRESS as `0x${string}`,
        abi: MULTIVAULT_ABI,
        functionName: 'atomsByHash',
        args: [atomHash],
      })

      if (existingAtomId !== BigInt(0)) {
        // Atom already exists, redirect to its page
        router.push(`/entry/${existingAtomId}`)
        return
      }

      // Prepare transaction data
      const fnData = encodeFunctionData({
        abi: MULTIVAULT_ABI,
        functionName: 'createAtom',
        args: [stringToHex(uri)],
      })

      const txData = {
        to: clientEnv.MULTIVAULT_ADDRESS as `0x${string}`,
        data: fnData,
        value: BigInt(cost),
      }

      const hash = await walletClient.sendTransaction(txData)
      console.log('Transaction sent:', hash)

      // Confirm transaction and tag atom
      const confirmResponse = await fetch('/api/entries/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash }),
      })

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm entry')
      }

      const result = await confirmResponse.json()
      if (result.status === 'error') {
        throw new Error(result.error)
      }

      router.push(`/entry/${result.id}`)
    } catch (err) {
      console.error('Failed to create entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />

      <div className="mb-8 py-4">
        <Link href="/">
          <Button variant="secondary">← Back to Feed</Button>
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleCreateEntry} className="space-y-4">
          <Text variant="heading5" className="mb-6 text-center">
            Create New Entry
          </Text>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              <Text variant="body">Name</Text>
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              <Text variant="body">Description</Text>
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              <Text variant="body">Image URL</Text>
            </label>
            <Input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              endAdornment="image"
              placeholder="example.com/image.jpg"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">
              <Text variant="body">External URL</Text>
            </label>
            <Input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              endAdornment="link"
              placeholder="example.com"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              <Text variant="body">{error}</Text>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Entry...' : 'Create Entry'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
