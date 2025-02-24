import { Text } from '@0xintuition/1ui'
import { AuthButton } from '@/components/AuthButton'
import { clientEnv } from '@/lib/env'

export function Header() {
  return (
    <header className="mb-8 flex justify-between items-center">
      <div>
        <Text variant="heading5">{clientEnv.APP_NAME}</Text>
        <Text variant="body" className="text-gray-600">
          {clientEnv.APP_DESCRIPTION}
        </Text>
      </div>
      <AuthButton />
    </header>
  )
}
