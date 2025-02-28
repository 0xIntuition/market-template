import { Header } from '@/components/Header'
import { HomeActions } from '@/components/HomeActions'
import AppFeed from '@/components/AppFeed'
import { getApps, SortOption } from '@/server/graphql'

export default async function Page() {
  const defaultSort: SortOption = 'likes'
  const verificationAddress = '0x6877daca5e6934982a5c511d85bf12a71a25ac1d'

  const apps = await getApps(defaultSort, verificationAddress)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-8">
        {/* Hero Section */}
        <div className="w-full mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-medium tracking-tight">Ecosystems</h1>
              <HomeActions />
            </div>
          </div>
        </div>

        {/* App Feed */}
        <div className="w-full">
          <AppFeed apps={apps} initialSortBy={defaultSort} verificationAddress={verificationAddress} />
        </div>
      </main>
    </div>
  )
}
