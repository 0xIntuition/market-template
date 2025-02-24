'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Text, Input, Textarea } from '@0xintuition/1ui'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { stringToHex, encodeFunctionData, keccak256 } from 'viem'
import { clientEnv } from '@/lib/env'
import { MULTIVAULT_ABI } from '@/lib/contracts'

interface NewSubEntryFormProps {
  entryId: string
}

export function NewSubEntryForm({ entryId }: NewSubEntryFormProps) {
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

  async function handleCreateSubEntry(event: React.FormEvent) {
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
      // Prepare the sub-entry data
      const subEntryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        url: formData.url.trim(),
        entryId,
      }

      // 1. Prepare sub-entry (pin to IPFS and get cost)
      const prepareResponse = await fetch('/api/subentries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subEntryData),
      })

      if (!prepareResponse.ok) {
        throw new Error('Failed to prepare sub-entry')
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
        // Atom already exists, confirm it as a sub-entry
        const confirmResponse = await fetch('/api/subentries/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hash: '0x0000000000000000000000000000000000000000000000000000000000000000', // Dummy hash since we already have the atom
            entryId,
            existingAtomId: existingAtomId.toString(),
          }),
        })

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm existing sub-entry')
        }

        const result = await confirmResponse.json()
        if (result.status === 'error') {
          throw new Error(result.error)
        }

        // Reset form and refresh page
        setFormData({ name: '', description: '', image: '', url: '' })
        router.refresh()
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
      const confirmResponse = await fetch('/api/subentries/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, entryId }),
      })

      if (!confirmResponse.ok) {
        throw new Error('Failed to confirm sub-entry')
      }

      const result = await confirmResponse.json()
      if (result.status === 'error') {
        throw new Error(result.error)
      }

      // Reset form and refresh page
      setFormData({ name: '', description: '', image: '', url: '' })
      router.refresh()
    } catch (err) {
      console.error('Failed to create sub-entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to create sub-entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="w-full rounded-xl p-2 border border-white/20"
      style={{
        background: `linear-gradient(to top, transparent 0%, rgba(251, 255, 0, 0.07) 100%, transparent 5%),
          linear-gradient(to right, transparent 0%, rgba(70, 70, 70, 0.05) 100%, transparent 5%),
          linear-gradient(to bottom, transparent 0%, rgba(77, 77, 77, 0.05) 100%, transparent 5%),
          linear-gradient(to left, transparent 0%, rgba(144, 155, 207, 0.12) 100%, transparent 5%)`,
      }}
    >
      <div className="grid w-full" style={{ gridTemplateColumns: '3fr ', gap: '2rem' }}>
        <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/20" style={{ background: '#000000' }}>
          <form onSubmit={handleCreateSubEntry} className="space-y-4">
            <Text variant="heading2" className="mb-6">
              Create New Sub-Entry
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
              {isSubmitting ? 'Creating Sub-Entry...' : 'Create Sub-Entry'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
