'use client'

import { AuthButton } from '@/components/AuthButton'

export function Header() {
  return (
    <header className="flex justify-between items-center p-8">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-background"></div>
      </div>
      <AuthButton />
    </header>
  )
}
