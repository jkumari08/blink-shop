# BlinkShop

**Instant social commerce on Solana.** Merchants create products. Buyers purchase directly from social media posts without leaving their feed. Payments settle in 400ms.


---

## Table of Contents
1. [Project Description](#project-description)
2. [Team](#team)
3. [Setup & Installation](#setup--installation)
4. [Architecture](#architecture)
5. [Tech Stack](#tech-stack)
6. [Features](#features)

---

## Project Description

BlinkShop is a two-sided social commerce platform:

**Merchants** create shareable product cards (Blinks) in seconds - no website needed.

**Buyers** click a Blink on X, Discord, or Reddit → select a token → approve → done in 400ms. No leaving the platform.

**Why it matters:**
- Traditional e-commerce: See post → Click link → Navigate website → Checkout → Wait days → Merchant loses 2-3% + $0.30
- BlinkShop: Click → Approve → Done in 400ms on Solana at $0.001/tx

---

## Team

**Team Name:** BlinkShop  
**Track:** Solana Main Track
**Bounty:** Circle  
**Team Members:** Jagrati Kumari (Full-Stack Blockchain Engineer - Solo)

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- Git
- A Solana wallet (Phantom, Solflare, Torus, or Ledger)

### Install & Run

```bash
git clone https://github.com/jkumari08/blink-checkout.git
cd blink-checkout
npm install
npm run dev
```

Open `http://localhost:8081` and connect your wallet.

### Get Devnet Tokens
- **SOL:** https://faucet.solana.com/
- **USDC/USDT:** https://spl-token-faucet.vercel.app/

### Test Flow
1. **Create Product:** Go to "Create Blink" → Fill form (name, description, price 5 USDC, image) → Generate link
2. **Purchase:** Switch to another wallet → Click the product link → Select token → Approve in wallet
3. **Verify:** Click Explorer link to see transaction on https://explorer.solana.com/?cluster=devnet

---

## Architecture

### System Design

```
Frontend (React)
    ↓
Web3 Layer (Web3.js + useMultiTokenTransaction)
    ↓
Solana Blockchain (Devnet)
    ├─ Token Transfers (SOL/USDC/USDT)
    ├─ Anchor Program (BlinkPaymentTracker)
    └─ RPC: https://api.devnet.solana.com
    ↓
External Services
    ├─ Circle APIs (Wallets, Payments, Settlement, Bridge)
    └─ Solana Explorer
```

### Data Flow
```
1. Merchant fills form → generates Blink URL
2. Buyer clicks Blink on social media
3. App loads product (BlinkPreview component)
4. Buyer selects token (SOL/USDC/USDT)
5. Clicks "Buy Now"
6. useMultiTokenTransaction hook creates transaction
7. Wallet signs
8. Transaction broadcast to devnet
9. Anchor program records payment on-chain
10. Circle settles funds
11. Success message with Explorer link

⏱️ Total: ~400ms
```

### File Structure

```
src/
├── components/
│   ├── BlinkPreview.tsx       # Product display + payment UI
│   ├── CreateBlink.tsx        # Product creation form
│   ├── Navbar.tsx             # Wallet connection
│   └── ui/                    # 30+ shadcn components
├── hooks/
│   └── useMultiTokenTransaction.ts  # Payment processor
├── lib/
│   ├── anchor-program.ts      # On-chain recording
│   ├── circle-advanced.ts     # Circle APIs
│   └── utils.ts
├── pages/
│   ├── Index.tsx              # Home
│   └── CreateBlink.tsx        # Product creation
└── App.tsx
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Blockchain** | Solana Web3.js, Anchor Framework |
| **Wallets** | Phantom, Solflare, Torus, Ledger |
| **Tokens** | SOL (native), USDC, USDT (SPL) |
| **Payments** | Circle APIs (all 4) |
| **UI** | Tailwind CSS, shadcn/ui |
| **Network** | Solana Devnet |

---

## Features

✅ Multi-token payments (SOL, USDC, USDT)  
✅ 4 wallet support  
✅ Real devnet transactions  
✅ On-chain payment recording (Anchor)  
✅ Circle Payments integration  
✅ Mobile responsive  
✅ Zero TypeScript errors  
✅ 400ms settlement  

---

## Token Mints (Devnet)

```
SOL:  Native
USDC: EPjFWaLb3odccccccccccccccccccccccccPEKjAxm
USDT: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEqw
```

---

## GitHub

https://github.com/jkumari08/blink-checkout

## Demo Video

https://youtu.be/2_zsfPyihlk

## Twitter

https://x.com/blinkshop2025
