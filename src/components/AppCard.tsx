import type React from 'react'
import { Card, Badge } from '@0xintuition/1ui'
import { Heart, Star, CheckCircle, ArrowUp, ArrowBigUp, ArrowUp10 } from 'lucide-react'

export interface AppData {
  id: number
  label: string
  url: string
  description: string
  created: string
  timestamp: number
  positions: number
  liked: boolean
  tags: string[]
  logoBg: string
  logo: React.ReactNode
  verified?: boolean
}

interface AppCardProps {
  app: AppData
  className?: string
}

export function AppCard({ app, className = '' }: AppCardProps) {
  return (
    <Card className={`bg-background border border-primary/20 rounded-xl p-6 relative ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: app.logoBg }}>
            {app.logo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-medium">{app.label}</h3>
              {app.verified && <CheckCircle className="h-5 w-5 text-warning" aria-label="Verified" />}
            </div>
            <p className="text-foreground/70 font-light">{app.url ?? ' '}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span>{app.positions}</span>
          <ArrowUp className={`h-5 w-5 ${app.liked ? 'text-red-500 fill-red-500' : 'text-white/60'}`} />
        </div>
      </div>

      <p className="text-foreground/70 font-light mb-4">{app.description}</p>
      <p className="text-primary/70 font-light text-sm mb-4">Created on {app.created}</p>

      <div className="flex flex-wrap gap-2">
        {app.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="border border-primary/20 text-foreground/70 px-3 py-1 rounded-lg capitalize"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  )
}
