# GBP Stablecoin Issuer Console

Internal issuer-side console for minting, redemption, compliance controls, and auditability across fiat and on-chain systems.

## Structure

- `apps/web` — Next.js console UI
- `apps/api` — Laravel API + audit logs
- `contracts` — Hardhat + Solidity ERC-20
- `scripts` — helper scripts
- `docs` — demo script and API notes

## Quick Start

### 1) Contracts

```bash
cd contracts
npm install
npm run node
```

In another terminal:

```bash
cd contracts
npm run compile
npm run deploy
```

Copy the deployed contract address.

### 2) API

```bash
cd apps/api
cp .env.example .env
```

Set:

- `CHAIN_PRIVATE_KEY` (from Hardhat node account)
- `CHAIN_CONTRACT_ADDRESS` (deployed address)

Then run:

```bash
php artisan migrate --seed
php artisan serve
```

### 3) Web

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_TOKEN` to a token from `POST /auth/login` (see below).

## Login

Seeded users (password: `password`):

- `admin@issuer.test`
- `approver@issuer.test`
- `viewer@issuer.test`

Use `POST /auth/login` to get a token.

## Chain Indexer

Run manually when you want to reconcile on-chain events:

```bash
cd apps/api
php artisan chain:index
```

## Demo Script

See `docs/demo.md`.
