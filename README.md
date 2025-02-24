# Intuition Market Template

A Next.js 15 template for building Ethereum-based market platforms with tradable entries and ERC20-like vault shares.

## 🚀 Features

- **Entry Management**: Create and maintain tradable entries with IPFS metadata storage
- **Vault Economics**: Deposit and redeem functionality with ERC20-like vault shares
- **Sub-entry Hierarchy**: Organize content with parent-child relationships
- **Smart Contract Integration**: MultiVault contract for asset management
- **Wallet Authentication**: Secure user authentication via Dynamic Labs SDK
- **Data Visualization**: Ownership pie charts and real-time vault statistics
- **GraphQL Backend**: Robust API for entry management
- **IPFS Integration**: Decentralized metadata storage
- **Responsive Design**: Built with Tailwind CSS and container queries

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Intuition's 1UI component library
- **Styling**: Tailwind CSS, 1UI theming
- **Blockchain**: Ethereum, Viem
- **Authentication**: Dynamic Labs SDK
- **Data Storage**: IPFS
- **API**: GraphQL
- **Build Tools**: Turbopack

## 🏁 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm 9.x

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Fill out the environment variables in the `.env` file
5. Run `pnpm new-wallet` to generate a new wallet to power your back-end. It will need to be funded in order to tag atoms that were created via your app.
6. Start the development server:
   ```bash
   pnpm dev
   ```

## 🚀 Deployment

Want to deploy this app quickly? Use the button below to deploy to Render:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/0xIntuition/market-template)

> Note: You'll need to configure environment variables in the Render dashboard after deployment.

- The Intuition MultiVault address is `0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665`
- You will need an API Key, Environment ID, and Public Key for Dynamic.XYZ
- You will need to generate a wallet and provide the private and public keys to the ENV
- You will need an App Name and App Description for both the server and the client
- The client uses this visually, whereas the server uses this to create a special atom for your app.
- Hop into our discord if you have any questions!

The project includes a `render.yaml` file that configures the deployment settings for Render. This file:

- Sets up a web service with the appropriate build and start commands
- Pre-configures some environment variables
- Includes a health check endpoint
- Marks sensitive environment variables that you'll need to set manually

## 🧩 Project Structure

- `src/app`: Next.js app router pages and API routes
- `src/components`: Reusable UI components
- `src/lib`: Utility functions and contract integrations
- `src/server`: Server-side logic and API handlers
- `src/types`: TypeScript type definitions
- `src/styles`: Global styles and theme configuration

## 💻 Development

- Add additional providers to `providers.tsx` (already wrapping `layout.tsx`)
- Add pages directly to the `app` directory following Next's app router conventions
- Theming is set up and pulls from `1ui` - any Shad components or Tailwind you write will respect this theme
- Recommended to add Shad components via the CLI, run in the root of this directory

## 📝 Scripts

- `pnpm dev`: Start development server with Turbopack
- `pnpm build`: Build the application for production
- `pnpm start`: Start the production server
- `pnpm lint`: Run ESLint
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm new-wallet`: Generate a new wallet to power your back-end
