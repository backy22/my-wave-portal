# My Wave Portal

A small full-stack dApp: a **WavePortal** Solidity contract and a **React** frontend. Visitors connect with MetaMask, send a short message and an optional image URL (for example a GIF), and see the feed of all waves on-chain.

## What it does

- **Wave** — Stores the caller’s address, timestamp, message, optional image link, and whether they won the mini lottery.
- **Cooldown** — Each address can wave again only after **15 minutes** (`require` in the contract).
- **Prize** — On each wave, a pseudo-random value gives roughly a **50%** chance to send **0.0001 ETH** from the contract balance to the waver (the contract must hold enough ETH).

Events `NewWave` and `NewWin` are emitted; the app listens for them to refresh the list and show confetti on a win.

## Repository layout

| Path | Role |
|------|------|
| `contracts/WavePortal.sol` | Main contract |
| `scripts/deploy.js` | Deploy with **0.001 ETH** sent to the contract (prize pool) |
| `scripts/run.js` | Local smoke test: deploy, wave twice, log state |
| `front/` | Create React App UI (`ethers` v5, MetaMask) |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [MetaMask](https://metamask.io/) (or another injected `window.ethereum` wallet)

## Smart contract (Hardhat)

Install dependencies at the repo root:

```shell
npm install
```

Compile:

```shell
npx hardhat compile
```

### Environment (testnet deploy)

`hardhat.config.js` defines a **`rinkeby`** network (replace with your target network and RPC if you migrate off deprecated testnets). Create a `.env` in the project root:

```env
STAGING_ALCHEMY_KEY=https://eth-rinkeby.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
```

Never commit `.env` or real keys.

Deploy to the configured network:

```shell
npx hardhat run scripts/deploy.js --network rinkeby
```

Copy the printed **WavePortal address**. The deploy script funds the contract with **0.001 ETH** so prizes can be paid.

### Local Hardhat network

Terminal A:

```shell
npx hardhat node
```

Terminal B (deploy to localhost, then optionally exercise the contract):

```shell
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/run.js --network localhost
```

## Frontend (`front/`)

The UI reads the contract ABI from `front/src/utils/WavePortal.json` and a **hardcoded** address in `front/src/App.js` (`contractAddress`). After each new deployment, **update that address** (and ensure the ABI matches if you change the contract).

```shell
cd front
npm install
npm start
```

Opens the dev server (by default [http://localhost:3000](http://localhost:3000)). Use a wallet pointed at the same chain as the deployed contract.

## Useful Hardhat commands

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat help
```

There is no Hardhat `test/` suite in this repo yet; the React app includes the default CRA test scaffold under `front/`.

## License

See `package.json` (`license` field) for the root package; contract SPDX is `UNLICENSED` in `WavePortal.sol`.
