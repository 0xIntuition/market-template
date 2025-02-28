import { Providers } from '@/app/providers'
import type { Metadata } from 'next'
import { clientEnv } from '@/lib/env'

import './globals.css'

export const metadata: Metadata = {
  title: clientEnv.APP_NAME,
  description: clientEnv.APP_DESCRIPTION,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
