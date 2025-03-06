import { Text } from '@0xintuition/1ui'
import { AuthButton } from '@/components/AuthButton'
import { clientEnv } from '@/lib/env'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  const isEntryAppPage = pathname === '/entry/app'

  return (
    <header className="mt-32 mb-8 flex justify-between items-center">
      <Link href={isEntryAppPage ? '/' : '/entry/app'} className="flex items-center gap-4">
        {clientEnv.APP_IMAGE && (
          <div className="h-12 relative rounded-lg overflow-hidden">
            <Image
              src={clientEnv.APP_IMAGE!}
              alt={clientEnv.APP_NAME as string}
              width={256}
              height={48}
              className="object-contain"
              style={{ maxWidth: '256px', maxHeight: '48px' }}
            />
          </div>
        )}
        <div>
          <Text variant="heading5">{clientEnv.APP_NAME}</Text>
          <Text variant="body" className="text-gray-600">
            {clientEnv.APP_DESCRIPTION}
          </Text>
        </div>
      </Link>
      <AuthButton />
    </header>
  )
}
