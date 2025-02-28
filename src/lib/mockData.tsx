import { AppData } from '@/components/AppCard'

export const apps: AppData[] = [
  {
    id: 1,
    name: 'Algebra',
    verified: false,
    url: 'algebra.finance',
    description:
      'Algebra is an AMM providing modular concentrated liquidity (V4) with dynamic fees and hooks to DEXes on Base.',
    created: '9 Jan 2021',
    likes: 681,
    liked: true,
    tags: ['defi', 'liquidity management'],
    logoBg: 'linear-gradient(135deg, #6a11cb, #2575fc)',
    logo: <div className="text-white font-bold">A</div>,
  },
  {
    id: 2,
    name: '0xPPL',
    verified: true,
    url: '0xppl.com',
    description:
      '0xPPL is a web3 social platform enabling you to follow or interact with onchain activities of your peers & discover trends.',
    created: '9 Jan 2021',
    likes: 999,
    liked: false,
    tags: ['consumer', 'social'],
    logoBg: 'white',
    logo: (
      <div className="grid grid-cols-2 gap-1">
        <div className="w-6 h-6 rounded-full bg-blue-500"></div>
        <div className="w-6 h-6 rounded-full bg-red-500"></div>
        <div className="w-6 h-6 rounded-full bg-blue-500"></div>
        <div className="w-6 h-6 rounded-full bg-blue-500"></div>
      </div>
    ),
  },
  {
    id: 3,
    name: 'Aerodrome Finance',
    verified: false,
    url: 'aerodrome.finance',
    description: 'The central trading and liquidity marketplace on Base.',
    created: '9 Jan 2021',
    likes: 918,
    liked: false,
    tags: ['defi', 'dex'],
    logoBg: 'white',
    logo: (
      <div className="flex flex-col items-center">
        <div className="h-1 w-8 bg-blue-600 mb-1"></div>
        <div className="h-1 w-8 bg-red-500"></div>
      </div>
    ),
  },
  {
    id: 4,
    name: '0x',
    verified: true,
    url: '0x.org',
    description: 'The standard for trading Ethereum tokens.',
    created: '12 Jan 2021',
    likes: 2900,
    liked: false,
    tags: ['defi', 'protocol'],
    logoBg: 'white',
    logo: <div className="text-black font-bold text-xl">Øx</div>,
  },
  {
    id: 5,
    name: 'Alchemy',
    verified: true,
    url: 'alchemy.com',
    description: 'Supercharged blockchain development platform.',
    created: '15 Jan 2021',
    likes: 382,
    liked: true,
    tags: ['infra', 'developer'],
    logoBg: 'black',
    logo: (
      <div className="border-2 border-white w-8 h-8 flex items-center justify-center">
        <div className="border-t-2 border-l-2 border-white w-4 h-4 transform rotate-45"></div>
      </div>
    ),
  },
  {
    id: 6,
    name: 'Aleph.im',
    verified: false,
    url: 'aleph.im',
    description: 'Decentralized cloud platform for Web3 applications.',
    created: '18 Jan 2021',
    likes: 1300,
    liked: false,
    tags: ['infra', 'storage'],
    logoBg: 'black',
    logo: (
      <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white rounded-full"></div>
      </div>
    ),
  },
]
