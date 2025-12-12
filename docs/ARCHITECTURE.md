# Synkio Architecture

## System Overview

Synkio is a conversational marketplace and universal payment platform powered by OpenAI GPT-4o-mini, providing multi-channel AI agents that interface users with vendors, payments, and blockchain services via WhatsApp (WaSender), Web chat, and Farcaster Mini Apps. The system emphasizes anonymity-first access, composability, fallback resiliency, and seamless multi-chain blockchain integration.

**Anonymous-First Architecture**: Users can browse vendors without authentication, but must sign in to make purchases, manage wallets, or become vendors. Email is the primary identifier, with username.synkio identity for user profiles.

**Universal Payment Architecture**: Synkio supports sending and requesting payments from anyone—even non-users—via email, phone, username, wallet address, or shareable claim links. Payments can be made with any supported token across multiple chains (Base, Ethereum, Solana) and automatically converted to the recipient's requested currency. Fiat integration is handled via Bread for on/off-ramp capabilities.

![Architecture Overview](assets/architecture-overview.mmd)

---

## Core Components

### 1. AI Agent Layer (Next.js Mini App)

**Location**: `apps/mini-app/app/api/agent/route.ts`

**Technology**: 
- OpenAI GPT-4o-mini
- Next.js 15 API Routes
- Function calling with backend tool integration

**Capabilities**:
- Intent classification and entity extraction
- Multi-step conversational workflows
- Context-aware responses across channels
- Backend tool orchestration
- Mini App sharing based on context

**Available Tools**:
- `search_vendors`: Search vendors by category and reputation
- `create_escrow`: Create escrow for marketplace transactions
- `check_reputation`: Verify user reputation before transactions
- `release_payment`: Release escrowed payments to sellers
- `file_dispute`: File disputes for unresolved transactions
- `get_transaction_status`: Check transaction status
- `create_vendor`: Create vendor profile
- `get_wallet_balance`: Get multi-chain wallet balance
- `fund_wallet`: Get wallet funding information
- `send_payment`: Send payment to email/phone/username/wallet
- `request_payment`: Request payment from anyone
- `get_payment_history`: Get payment history and pending requests
- `split_payment`: Split payment among multiple recipients
- `get_points_balance`: Get user points balance and level
- `earn_points`: Award points for user actions

### 2. Backend Service

**Location**: `apps/backend/src/`

**Technology**:
- Node.js/Express
- MongoDB for data persistence
- Ethers.js v6 for blockchain interactions
- Blockradar API for wallet infrastructure (optional)
- Redis (optional) for queue management

**Architecture**:
```
apps/backend/src/
├── controllers/         # Route handlers
│   ├── EscrowController.ts
│   ├── IdentityController.ts
│   ├── ReputationController.ts
│   └── TransactionController.ts
├── services/           # Business logic
│   ├── EscrowService.ts
│   ├── PaymentService.ts
│   ├── ReputationService.ts
│   ├── DisputeService.ts
│   ├── WalletService.ts
│   ├── BlockchainService.ts
│   └── BlockradarService.ts
├── models/            # Database schemas
│   ├── User.ts
│   └── Transaction.ts
└── routes/            # API endpoints
    ├── escrow.ts
    ├── identity.ts
    ├── reputation.ts
    ├── transactions.ts
    └── vendors.ts
```

**API Endpoints**:

**Identity** (`/api/identity/*`):
- `GET /:email/wallet/balance` - Get wallet balance
- `POST /create` - Create user profile
- `GET /:email` - Get user profile

**Points** (`/api/points/*`):
- `GET /balance` - Get user points balance and level
- `GET /history` - Get points transaction history
- `POST /earn` - Award points (internal, triggered by actions)
- `POST /spend` - Spend points on rewards (requires auth)

**Escrow** (`/api/escrow/*`):
- `POST /create` - Create escrow
- `POST /:id/fund` - Fund escrow
- `POST /:id/release` - Release payment
- `POST /:id/dispute` - File dispute
- `GET /:id` - Get escrow details

**Reputation** (`/api/reputation/*`):
- `GET /:address` - Get reputation score
- `POST /update` - Update reputation

**Transactions** (`/api/transactions/*`):
- `GET /:email/:id` - Get transaction status
- `GET /:email` - List user transactions

### 3. Smart Contract Layer

**Location**: `apps/contracts/contracts/`

**Network**: Base (Base Sepolia testnet / Base mainnet)

**Contracts**:

**EscrowManager** (`contracts/core/EscrowManager.sol`):
```solidity
- createEscrow(): Create escrow with milestones
- fundEscrow(): Buyer funds escrow
- releasePayment(): Release payment to seller
- fileDispute(): File dispute
- cancelEscrow(): Cancel unfunded escrow
- expireEscrow(): Refund on expiration
```

**ReputationRegistry** (`contracts/core/ReputationRegistry.sol`):
```solidity
- updateReputation(): Update on-chain reputation
- getReputation(): Get user reputation score
```

**PaymentProcessor** (`contracts/core/PaymentProcessor.sol`):
```solidity
- processPayment(): Process payment with fees
- distributeFees(): Distribute platform fees
```

**DisputeResolution** (`contracts/governance/DisputeResolution.sol`):
```solidity
- resolveDispute(): Resolve dispute with arbitrator
- escalateDispute(): Escalate to multi-sig
```

### 4. Multi-Channel Integration

#### WhatsApp (WaSender)

**Location**: `apps/mini-app/app/api/webhook/whatsapp/route.ts`

**Flow**:
1. WaSender receives message → Webhook to `/api/webhook/whatsapp`
2. Extract message text and phone number
3. Call AI agent with context
4. Send response via WaSender API

**Features**:
- Phone number-based thread management
- Signature verification for webhook security
- Conversational flow maintained across sessions

#### Web Interface

**Location**: `apps/mini-app/app/page.tsx`

**Features**:
- Full chat interface
- Wallet balance display
- Vendor discovery modal
- Direct blockchain interaction
- Responsive design for mobile/desktop

#### Farcaster Mini App

**Configuration**: `apps/mini-app/minikit.config.ts`

**Features**:
- MiniKit manifest for Farcaster integration
- Embedded chat interface
- On-chain profile integration
- Cast sharing capabilities

---

## Data Flow

![System Flow](assets/system-flow.mmd)

### Example: Creating an Escrow Transaction

1. **User Input**: "I want to buy a laptop from VendorX for 2 ETH"
2. **AI Agent**: Detects intent `create_escrow` with params `{seller, amount, tokenAddress, metadata}`
3. **Backend API**: `POST /api/escrow/create`
   - Create transaction record in MongoDB
   - Call EscrowManager contract `createEscrow()`
4. **Smart Contract**: Create escrow on Base blockchain
   - Return escrow ID
   - Emit `EscrowCreated` event
5. **Backend Response**: Return escrow ID and funding instructions
6. **AI Response**: "Escrow created! Transaction ID: 0x123... Fund your escrow to proceed."
7. **User Display**: Show transaction details and funding steps

---

## Data Normalization

### WhatsApp Message Format

**Raw WaSender Message**:
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "field": "messages",
      "value": {
        "messages": [{
          "from": "2348012345678",
          "id": "wamid.xxx",
          "timestamp": "1234567890",
          "text": {"body": "I want to buy something"}
        }],
        "contacts": [{
          "profile": {"name": "John Doe"},
          "wa_id": "2348012345678"
        }]
      }
    }]
  }]
}
```

**Normalized Internal Format**:
```json
{
  "channel": "whatsapp",
  "threadId": "2348012345678",
  "userEmail": "2348012345678@whatsapp.link",
  "message": "I want to buy something",
  "context": {
    "profileName": "John Doe",
    "phoneNumber": "2348012345678"
  }
}
```

### User Model Schema

```typescript
interface IUser {
  email: string;                    // Primary key
  farcasterFid?: number;            // Farcaster integration
  walletAddress: string;             // On-chain identity
  encryptedPrivateKey?: string;     // Wallet private key (optional with Blockradar)
  blockradarAddressId?: string;     // Blockradar address ID (optional)
  blockradarNetwork?: string;       // Blockradar network identifier
  phoneNumber?: string;              // WhatsApp integration
  googleId?: string;                 // Google OAuth
  
  consentGiven: boolean;             // GDPR compliance
  onboardingCompleted: boolean;     // Onboarding status
  baseName?: string;                // Base name (for identity)
  ensName?: string;                  // ENS name (for identity)
  
  profile: {
    name: string;
    bio?: string;
    isVendor: boolean;
    categories?: string[];
    avatar?: string;
    location?: string;
    website?: string;
  };
  
  reputation: {
    score: number;                   // 0-1000
    totalTransactions: number;
    completedTransactions: number;
    disputes: number;
    totalVolume: number;
    lastUpdated: Date;
  };
  
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    kycCompleted: boolean;
    documentsUploaded: boolean;
  };
  
  points: {
    balance: number;                  // Total points balance
    level: number;                    // User level based on points
    lastUpdated: Date;
  };
}
```

---

## Security Considerations

### Backend Service

- **Private Keys**: Encrypted storage in MongoDB (local wallets) or Blockradar API (managed wallets)
- **Blockradar Security**: API key and secret authentication, HTTPS-only communication
- **Webhook Verification**: HMAC SHA-256 signature verification for WaSender
- **Rate Limiting**: Express rate limiter (100 req/15min per IP)
- **Helmet**: Security headers via Helmet middleware
- **CORS**: Configured for production domains

### Smart Contracts

- **Access Control**: OpenZeppelin Ownable for admin functions
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause mechanism
- **Timeouts**: Escrow expiration (30 days) and dispute timeout (7 days)

---

## Deployment Architecture

### Production Environment

**Mini App**:
- Hosting: Vercel
- Edge Functions: API routes at edge
- Environment: Production Base network

**Backend Service**:
- Hosting: Docker container (via docker-compose)
- Database: MongoDB Atlas
- Redis: Optional for queue management
- Network: Base mainnet

**Smart Contracts**:
- Network: Base mainnet
- Deployment: Hardhat scripts
- Verification: Etherscan verification

### Development Environment

- **Backend**: Local MongoDB, Base Sepolia testnet
- **Mini App**: Next.js dev server
- **Contracts**: Local Hardhat network or Base Sepolia
- **Environment Variables**: `.env.local` files per app

---

## API Service Contracts

### Escrow Service

```typescript
interface EscrowService {
  createEscrow(params: {
    seller: string;
    amount: string;
    tokenAddress: string;
    deadline: number;
    buyerEmail: string;
    sellerEmail: string;
    metadata: TransactionMetadata;
    conversationContext: ConversationContext;
  }): Promise<{ escrowId: string; transactionHash: string }>;
  
  releasePayment(escrowId: string, milestoneIndex: number): Promise<TransactionReceipt>;
  
  fileDispute(escrowId: string, reason: string, evidence: string[]): Promise<void>;
  
  getEscrow(escrowId: string): Promise<Escrow>;
}
```

### Wallet Service

```typescript
interface WalletService {
  getBalance(email: string): Promise<{
    walletAddress: string;
    balance: string;
    currency: string;
    network: NetworkInfo;
    provider: 'blockradar' | 'local';
  }>;
  
  createWallet(email: string, profile: UserProfile): Promise<WalletInfo>;
  
  fundWallet(email: string, amount: string, source: 'bread' | 'paystack' | 'flutterwave'): Promise<FundingInstructions>;
}
```

### Blockradar Integration

**Location**: `apps/backend/src/services/BlockradarService.ts`

**Purpose**: Optional wallet infrastructure service that provides:
- Master wallet and child address management
- Balance retrieval via API
- Transaction history and monitoring
- Token swaps and withdrawals
- Multi-chain support

**Configuration**:
- Enabled when `BLOCKRADAR_API_KEY` and `BLOCKRADAR_API_SECRET` are set
- Falls back to local wallet creation if Blockradar is not configured
- Supports Base network by default (configurable via `BLOCKRADAR_BASE_URL`)

**User Model Updates**:
- `blockradarAddressId`: Optional Blockradar address ID
- `blockradarNetwork`: Network identifier (default: 'base')
- `encryptedPrivateKey`: Optional when using Blockradar (not required)

**Service Interface**:
```typescript
interface BlockradarService {
  generateAddress(network: string, label?: string): Promise<BlockradarAddress>;
  getAddressBalance(addressId: string, asset?: string): Promise<Balance>;
  getTransactions(addressId?: string): Promise<Transaction[]>;
  withdrawFromAddress(addressId: string, params: WithdrawParams): Promise<Transaction>;
  getSwapQuote(params: SwapQuoteParams): Promise<SwapQuote>;
  executeSwap(params: SwapParams): Promise<Transaction>;
}
```

**Integration Flow**:
1. Wallet creation checks for Blockradar credentials
2. If available, creates address via Blockradar API
3. Stores `blockradarAddressId` in User model
4. Balance retrieval uses Blockradar API when `blockradarAddressId` exists
5. Falls back to local wallet operations if Blockradar unavailable

### Points Service

```typescript
interface PointsService {
  getBalance(userId: string): Promise<{
    balance: number;
    level: number;
    nextLevelPoints: number;
  }>;
  
  getHistory(userId: string, limit?: number): Promise<PointsTransaction[]>;
  
  earnPoints(userId: string, amount: number, category: string, description: string): Promise<void>;
  
  spendPoints(userId: string, amount: number, reward: string): Promise<boolean>;
  
  calculateLevel(points: number): number;
}
```

### 5. Payment Routing & Multi-Chain Support

#### Multi-Chain Wallet Management

**Supported Networks**:
- Base (primary)
- Ethereum
- Solana
- Additional chains via routing

**Custodial Wallet Structure**:
- One wallet per user, multi-chain capable
- Private keys encrypted and stored
- Password/PIN required for all send

#### Swap & Conversion Layer

**DEX Aggregator Integration**:
- **EVM Chains (Base, Ethereum)**: 0x API for swap routing
- **Solana**: Jupiter Exchange API
- **Cross-Chain**: Optional Thorchain integration

**Swap Flow**:
1. User wants to pay with Token A, recipient wants Token B
2. System fetches quote from aggregator
3. Shows conversion rate, slippage, fees
4. User authorizes with password
5. System executes swap via aggregator
6. Sends converted token to recipient

**Quote Endpoint**:
```typescript
GET /api/swap/quote?fromToken=ETH&toToken=USDC&amount=1.0&chain=base
```

#### Fiat Integration via Bread

**Bread API Integration**:
- Fiat on-ramp: Card/bank → Crypto
- Fiat off-ramp: Crypto → Bank account
- Supports multiple currencies (USD, NGN, EUR, etc.)

**Fiat Flow**:
1. User requests fiat payment or funding
2. System routes to Bread API
3. User completes KYC/payment via Bread
4. Bread handles conversion and settlement
5. Funds appear in user's Synkio wallet or recipient's bank

**Integration Points**:
- `POST /api/fiat/onramp` - Initiate fiat-to-crypto
- `POST /api/fiat/offramp` - Initiate crypto-to-fiat
- Webhook: `POST /api/webhook/bread` - Payment status updates

#### Universal Payment System

**Payment Request Flow**:
1. User creates payment request via chat or API
2. System generates unique claim link
3. Recipient receives notification (email/SMS/in-app)
4. Recipient clicks claim link
5. Recipient chooses payout method (crypto wallet, fiat bank, etc.)
6. System processes payment with conversion if needed
7. Funds delivered to recipient

**Payment Request Data Model**:
```typescript
interface PaymentRequest {
  requestId: string;
  senderId: string;
  recipient: {
    userId?: string;
    email?: string;
    phone?: string;
    walletAddress?: string;
  };
  amount: string;
  currency: string;
  preferredPayout: 'crypto' | 'fiat' | 'any';
  status: 'pending' | 'claimed' | 'cancelled' | 'expired';
  expirationDate: Date;
  claimLink: string;
  swapNeeded: boolean;
  swapDetails?: {
    fromToken: string;
    toToken: string;
    rate: string;
  };
}
```

**API Endpoints**:
- `POST /api/payment/send` - Send payment (requires password auth)
- `POST /api/payment/request` - Create payment request
- `POST /api/payment/claim` - Claim payment via link
- `GET /api/payment/history` - Get payment history
- `POST /api/payment/split` - Split payment among recipients

#### Security for Custodial Wallets

**Authentication Requirements**:
- Password/PIN required for all send operations
- Passwords hashed with bcrypt (never stored plaintext)
- Rate limiting on failed authentication attempts
- Optional biometric authentication (future)

**Wallet Security**:
- Private keys encrypted
- Encryption key derived from user password
- Hot wallet for small transactions
- Cold wallet for large balances (future)

---

## Design Principles

- 🧩 **Modular**: Swappable services and providers
- 💬 **Chat-Native**: Messages first, UI optional
- 🔄 **Composable**: MCP client support for third-party integrations
- 🛡️ **Resilient**: Fallback mechanisms for critical services
- 🔗 **Multi-Chain**: Support for Base, Ethereum, Solana with automatic routing
- 💱 **Universal Payments**: Pay with any token, receive in any currency
- 🔐 **Custodial Security**: Password-protected wallets with encrypted keys
- 📊 **Reputation-Based**: On-chain reputation scores for trust
- 🎯 **Points System**: Gamification layer for engagement without monetary value

---

## Next Steps

1. Bread integration for fiat on/off-ramp 
2. Implement 0x API integration for EVM swap routing
3. Implement Jupiter API integration for Solana swaps
4. Add WhatsApp template messages for transaction updates
5. Build vendor verification flow with document upload
6. Add multi-sig wallet support for high-value transactions
7. Implement payment request expiration and auto-refund
8. Add payment history and analytics dashboard
9. Implement points system with earning and spending mechanics
10. Build points rewards catalog (badges, themes, early access)
