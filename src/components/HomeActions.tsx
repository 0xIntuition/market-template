'use client'

import { Button, ButtonSize, ButtonVariant } from '@0xintuition/1ui'

export function HomeActions() {
  return (
    <div className="flex items-center gap-4">
      <Button variant={ButtonVariant.secondary} size={ButtonSize.lg}>
        Submit App
      </Button>
      <span className="text-base text-muted-foreground">Powered by Intuition</span>
    </div>
  )
}
