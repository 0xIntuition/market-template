# Overview

- This is a barebones Next.js app that works with 1ui, Next 15, and Turbopack
- Add additional providers to `providers.tsx` -- this is already wrapping `layout.tsx`
- You can see the use of the `'use client'` directive in the `providers.tsx` and `page.tsx`
- Add pages directly to the `app` directory following Next's _app router_ conventions
- Theming is set up and pulls from `1ui` -- any Shad components or Tailwind you write will respect this theme
- Recommended to add Shad components via the CLI, run in the root of this directory

# Project Summary

1. 🏗️ Next.js 15 template integrating Intuition's 1UI component library and Turbopack
2. 💼 Ethereum-based market platform for creating/maintaining tradable entries with ERC20-like vault shares
3. 📦 Core features:
   - Entry creation with IPFS metadata storage (`src/app/api/entries/route.ts:23-52`)
   - Sub-entry hierarchy system (`src/components/NewSubEntryForm.tsx:16-163`)
   - Vault economics with deposit/redeem functionality (`src/components/SwapModal.tsx:24-297`)
4. 🔗 Smart contract integration:
   - MultiVault contract for asset management (`src/lib/contracts.ts:3-17`)
   - Atom/Triple system for content relationships (`src/server/appTags.ts:5-32`)
5. 🔐 Wallet authentication via Dynamic Labs SDK (`src/app/providers.tsx:11-43`)
6. 📊 Data visualization:
   - Ownership pie charts (`src/components/EntryCard.tsx:236-247`)
   - Real-time vault statistics (`src/components/EntryCard.tsx:215-234`)
7. 🗃️ GraphQL backend integration for entry management (`src/server/entries.ts:37-116`)
8. 🎨 1UI component library usage throughout UI:
   - Cards, inputs, charts (`src/components/EntryCard.tsx:123-285`)
   - Command palette search (`src/components/EntryFeed.tsx:151-180`)
9. 🌐 IPFS integration for decentralized metadata storage (`src/server/atoms.ts:15-32`)
10. 📱 Responsive design with Tailwind CSS and container queries (`tailwind.config.ts:6-17`)

Key technologies: INTUITION, Next.js 15, 1UI, Ethereum, Viem, Dynamic Labs, IPFS, GraphQL, Turbopack
