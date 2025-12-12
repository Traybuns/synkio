# Synkio Product Requirements Document (PRD)

## Overview

Synkio is a conversational marketplace that enables users to discover vendors, chat naturally, and pay onchain through natural conversation. The platform supports three channels: WhatsApp (WaSender), Web, and Farcaster Mini Apps, with a unified AI agent providing seamless onboarding and transaction flows.

Synkio provides universal payment capabilities, allowing users to send and request payments from anyone—even non-users—using any supported token or fiat currency across multiple blockchain networks (Base, Ethereum, Solana). Payments can be sent to email, phone, username, wallet address, or via shareable claim links, with automatic currency conversion and routing through decentralized swap aggregators and fiat on/off-ramp providers.

---

## Product Vision

**Mission**: Make commerce conversational and onchain accessible to everyone.

**Tagline**: "Conversational Market | Let's Transact together securely"

**Target Users**:
- **Buyers**: Users seeking products and services with onchain payment options
- **Vendors**: Small businesses and freelancers can choose to accept payments in fiat and synkio handles the process of resolving the value from the crypto.
- **Payment**
---

## Core User Flows

### 1. Onboarding Flow

#### Anonymous-First Approach

**Key Principle**: All users are anonymous by default. They can browse vendors without signing in. Authentication is required for:
- Making purchases (escrow creation)
- Wallet management operations
- Becoming a vendor
- Transaction history access

#### Pre-Onboarding: Data Collection & Consent

**Requirements**:
- GDPR-compliant consent for data collection
- Username.synkio identity for all users
- Email as primary identifier or Google account integration 
- Password for custodial wallet security

**Flow**:
1. User discovers Synkio through any channel (WhatsApp, Web)
2. Landing Page shown with quick links: Find Vendors, Get Started
3. User can browse vendors without signing in
4. When user attempts to make a purchase or access wallet: AI prompts sign-in
5. Data collection prompts:
   - Email, username (johndoe → johndoe.synkio), password, name
   - "Would you like to connect your Google account? (optional)"
6. User provides consent: "I consent to data collection and storage."
7. AI confirms: "Great! Your data is secure and encrypted."

#### Wallet Creation & Funding

**Requirements**:
- Automatic custodial wallet creation (one per user)
- Encrypted private key storage
- Funding via Bread (primary)
- Multi-chain wallet support (Base, Ethereum, Solana)
- Onboarding completion marker

**Flow**:
1. AI: "Let's create your wallet. I'll generate a secure custodial wallet for you."
2. Wallet creation: Backend generates wallet and stores encrypted private key
3. AI: "Wallet created! Now let's fund it. Choose your method:"
   - Bread (recommended) - Direct fiat-to-crypto on/off-ramp
   - Paystack/Flutterwave - Card-based funding
4. User selects method
5. AI provides funding instructions with wallet address
6. User completes funding
7. AI: "Welcome to Synkio! You're all set to discover vendors and make payments."

### 2. Vendor Discovery Flow

**User Intent**: "I'm looking for electronics vendors"

**Flow**:
1. AI: "I'll search for electronics vendors with good ratings."
2. Tool Call: `search_vendors({category: "electronics", minReputation: 700})`
3. Backend returns vendor list
4. AI: "Here are some top-rated electronics vendors:"
   - Vendor A: Electronics Store | Reputation: 850 | 150 transactions
   - Vendor B: Tech Solutions | Reputation: 780 | 89 transactions
5. User: "Show me Vendor A's profile"
6. AI displays vendor profile (bio, categories, ratings, completed transactions)
7. User: "I want to buy a laptop for 2 ETH"
8. **If user is not authenticated**: AI prompts: "To make a purchase, please sign in first."
9. **If user is authenticated**: AI initiates escrow creation

### 3. Transaction Flow

#### Escrow Creation

**User Input**: "I want to buy a laptop for 2 ETH from VendorA"

**Flow**:
1. AI: "I'll create an escrow to protect your purchase. Let me set that up."
2. Tool Call: `create_escrow({
   seller: "vendorA@example.com",
   amount: "2.0",
   tokenAddress: "0x0000...",
   deadline: 1737849600,
   buyerEmail: "buyer@example.com",
   sellerEmail: "vendorA@example.com",
   metadata: {title: "Laptop Purchase", description: "Gaming laptop", milestones: []}
 })`
3. Backend creates escrow:
   - Transaction record in MongoDB
   - Smart contract call to `EscrowManager.createEscrow()`
   - Escrow ID returned
4. AI: "Escrow created! Transaction ID: 0xabc123..."
5. AI: "To fund your escrow, send 2 ETH to: 0x... (I'll handle the rest!)"
6. User funds escrow
7. AI: "Escrow funded! Seller will deliver your laptop. I'll notify you when it's ready."

#### Payment Release

**Context**: Seller delivers laptop; buyer confirms receipt

**Flow**:
1. User: "The laptop arrived! Release payment."
2. AI: "Perfect! I'll release the payment to Vendor A."
3. Tool Call: `release_payment({escrowId: "0xabc123"})`
4. Backend:
   - Calls `EscrowManager.releasePayment()`
   - Updates transaction status
   - Updates reputation scores
5. AI: "Payment released! 2 ETH sent to Vendor A. Your reputation updated."
6. AI: "Would you like to leave a review?"

#### Dispute Flow

**Context**: Buyer receives wrong item

**Flow**:
1. User: "This is the wrong laptop. I want to dispute."
2. AI: "I'll help you file a dispute. What's the reason?"
3. Tool Call: `file_dispute({
   escrowId: "0xabc123",
   reason: "Wrong item received",
   evidence: ["photo1.jpg", "order_confirmation.pdf"]
 })`
4. Backend creates dispute:
   - Calls `EscrowManager.fileDispute()`
   - Stores evidence in MongoDB
   - Notifies arbitrator
5. AI: "Dispute filed! An arbitrator will review within 48 hours."
6. Arbitrator resolves dispute
7. AI: "Dispute resolved! Your refund has been processed."

### 4. Wallet Management Flow

**User Input**: "What's my wallet balance?"

**Flow**:
1. Tool Call: `get_wallet_balance()`
2. Backend returns balance from MongoDB and onchain
3. AI: "Your wallet balance: 5.2 ETH on Base Sepolia network."
4. AI: "Wallet address: 0x... (you can receive funds here)"

**Funding Request**: "I want to add 100 USD to my wallet"

**Flow**:
1. AI: "I'll help you fund your wallet. Here are your options:"
   - Bread (recommended) - Fiat on/off-ramp
   - Paystack - Card payment
   - Flutterwave - Card payment
2. Tool Call: `fund_wallet()`
3. AI: "Fund your wallet via Bread: Link below."
4. User completes funding
5. AI: "Funds received! Your balance updated: 5.7 ETH."

### 5. Vendor Registration Flow

**User Input**: "I want to become a vendor"

**Flow**:
1. AI: "Great! Let's set up your vendor profile. I'll need some information."
2. AI: "Business name?"
3. User: "Tech Solutions Inc"
4. AI: "Description?"
5. User: "Electronics and tech solutions"
6. AI: "Categories (electronics, clothing, food, services)?"
7. User: "electronics"
8. Tool Call: `create_vendor({
   name: "Tech Solutions Inc",
   bio: "Electronics and tech solutions",
   categories: ["electronics"],
   location: "Lagos, Nigeria"
 })`
9. Backend creates vendor profile
10. AI: "Vendor profile created! You're now listed on Synkio."

### 6. Universal Payment & Request System

#### Send Payment to Anyone

**User Input**: "Send $50 to Chidera" or "Send ₦10,000 to john@example.com"

**Flow**:
1. AI parses recipient (email, phone, username, wallet address, or contact name)
2. AI: "I'll send $50 to Chidera. Enter your password to authorize."
3. User enters password/PIN for custodial wallet authentication
4. System checks balance and routing requirements
5. If recipient is Synkio user: Direct in-app notification
6. If recipient is not a user: Generate claim link and send via email/SMS
7. AI: "Payment sent! Chidera will receive a notification."

#### Request Payment from Anyone

**User Input**: "Request ₦15,000 from my husband" or "Ask John to pay me 20 USDC"

**Flow**:
1. AI identifies recipient from contacts or asks for identifier
2. AI: "I'll send a payment request to [recipient]. Amount: ₦15,000. Proceed?"
3. User confirms
4. System creates payment request with claim link
5. If recipient is Synkio user: In-app notification
6. If recipient is not a user: Email/SMS with claim link
7. Recipient can pay with any supported token or fiat
8. System auto-converts to requested currency if needed

#### Payment Claim Flow

**Context**: Non-user receives payment request via email/SMS

**Flow**:
1. Recipient clicks claim link
2. System shows: "You've received ₦15,000 from [sender]. How do you want to receive it?"
3. Options:
   - Crypto wallet (any supported chain)
   - Fiat bank payout (via Bread)
   - Convert to different currency
4. Recipient selects option
5. System processes payment (swap if needed, fiat conversion if needed)
6. Funds delivered to recipient's chosen method

### 7. Multi-Chain & Multi-Asset Payment Support

#### Supported Networks
- Base (primary)
- Ethereum
- Solana
- Additional chains via routing

#### Pay with Any Token, Receive Any Currency

**User Input**: User has ETH, wants to pay merchant who requests USDC

**Flow**:
1. User: "Pay 100 USDC to merchant@example.com using my ETH"
2. System detects user holds ETH, merchant wants USDC
3. System fetches swap quote from DEX aggregator (0x API for EVM, Jupiter for Solana)
4. System shows conversion rate and fees
5. User authorizes with password
6. System executes swap: ETH → USDC
7. System sends USDC to merchant
8. Transaction complete

#### Fiat Integration via Bread

**User Input**: User wants to pay with fiat card, merchant wants crypto

**Flow**:
1. User: "Pay $100 to merchant using my card"
2. System routes to Bread API for fiat on-ramp
3. User completes card payment via Bread
4. Bread converts fiat → USDC
5. System sends USDC to merchant
6. Transaction complete

### 8. Split Payments

**User Input**: "Split ₦30,000 among John, Chidera, and Emeka"

**Flow**:
1. AI: "I'll split ₦30,000 into 3 payments of ₦10,000 each. Proceed?"
2. User confirms
3. System creates 3 payment requests
4. Each recipient receives notification/claim link
5. Recipients can pay individually
6. System tracks completion status

### 9. Payment History & Status

**User Input**: "Show me my payment history" or "Who owes me money?"

**Flow**:
1. System retrieves all payment requests and transactions
2. AI displays:
   - Pending requests (awaiting payment)
   - Completed payments
   - Payment requests sent to others
3. User can filter by date, status, or recipient
4. User can send reminders for unpaid requests

### 10. Points System

#### Overview

Synkio uses a Points system to reward user engagement and activity without requiring tokens or monetary value. Points are non-transferable, non-tradeable, and have no cash value. They serve as a gamification layer to encourage platform usage and reward early adopters.

#### Points Earning

**Ways to Earn Points**:
- **Onboarding**: New users receive welcome points upon account creation
- **Transactions**: Earn points for completing escrow transactions
- **Referrals**: Earn points for referring new users or vendors
- **Activity**: Points for daily logins, completing profile, etc.
- **Feedback**: Points for leaving reviews and ratings
- **Vendor Activity**: Vendors earn points for successful transactions

**Point Values** (examples):
- Account creation: 100 points
- Complete transaction: 50 points
- Refer a user: 200 points
- Refer a vendor: 500 points
- Leave a review: 25 points
- Daily login streak: 10 points per day

#### Points Usage

**Points CAN Be Used For**:
- **Profile Customization**: Unlock profile badges, avatars, themes
- **Early Access**: Priority access to new features and beta testing
- **Queue Priority**: Faster processing for support requests
- **Community Ranks**: Display user level/rank based on points
- **Voting**: Participate in feature polls and governance (light)
- **Discounts**: Future discounts on platform fees (after mainnet launch)
- **Cosmetics**: Unlock UI themes, chat bubble styles, etc.

**Points CANNOT Be Used For**:
- Features with direct server costs (AI inference, API calls)
- Paid features that require real money
- Converting to cryptocurrency or fiat
- Trading or transferring to other users
- Unlocking premium vendor features that cost money

#### Points Display & Management

**User Input**: "How many points do I have?" or "Show my points"

**Flow**:
1. System retrieves user's point balance
2. AI displays: "You have 1,250 points. You're at Level 3!"
3. Shows recent point history and earning opportunities
4. User can view available rewards and redemption options

#### Points Data Model

```typescript
interface PointsBalance {
  userId: string;
  totalPoints: number;
  level: number;              // Based on total points
  pointsHistory: PointsTransaction[];
  lastUpdated: Date;
}

interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;             // Positive for earned, negative for spent
  type: 'earned' | 'spent';
  category: 'onboarding' | 'transaction' | 'referral' | 'activity' | 'reward';
  description: string;
  timestamp: Date;
}
```

#### Future Considerations

**Optional Token Conversion** (Future):
- Points may be converted to tokens at a fixed ratio if/when tokens launch
- Conversion is optional and not guaranteed
- Ratio would be determined at token launch
- Users would need to opt-in to conversion

**No Financial Obligation**:
- Points have no monetary value
- Synkio has no obligation to convert points to tokens
- Points system can evolve independently of token plans

---

## User Stories

### Story 1: Sending Payment to Non-User
**As a** Synkio user  
**I want to** send payment to someone who doesn't have a Synkio account  
**So that** I can pay anyone, even if they're not on the platform yet

**Acceptance Criteria**:
- User can send payment via email, phone, or username
- Non-user receives claim link via email/SMS
- Non-user can claim payment without creating account first
- Payment is held securely until claimed

### Story 2: Requesting Payment via Chat
**As a** Synkio user  
**I want to** request payment from a friend using natural language  
**So that** I don't need to remember wallet addresses or use complex interfaces

**Acceptance Criteria**:
- User can say "Request $50 from Chidera" in chat
- System identifies recipient from contacts or asks for identifier
- Recipient receives notification (in-app or external)
- Recipient can pay with any supported token or fiat

### Story 3: Multi-Asset Payment
**As a** Synkio user  
**I want to** pay with any token I hold, even if merchant wants different currency  
**So that** I don't need to manually swap tokens before paying

**Acceptance Criteria**:
- User can pay with any supported token
- System automatically swaps to requested currency
- User sees conversion rate before confirming
- Swap happens seamlessly in background

### Story 4: Custodial Wallet Security
**As a** Synkio user  
**I want to** authorize payments with password/PIN  
**So that** my funds are secure even if my device is compromised

**Acceptance Criteria**:
- All send operations require password/PIN
- Password is hashed and never stored in plaintext
- Failed attempts are rate-limited
- Optional biometric authentication for convenience

### Story 5: Fiat On-Ramp for Non-Crypto Users
**As a** non-crypto user  
**I want to** pay with my card or bank account  
**So that** I can use Synkio without buying crypto first

**Acceptance Criteria**:
- User can fund wallet via Bread integration
- User can pay merchants directly with fiat
- System handles fiat-to-crypto conversion automatically
- User sees clear pricing and fees

### Story 6: Payment Link Sharing
**As a** Synkio user  
**I want to** share a payment link with anyone  
**So that** they can pay me without needing my wallet address

**Acceptance Criteria**:
- User can generate shareable payment link
- Link can be sent via any channel (WhatsApp, email, SMS)
- Link expires after set time period
- User can cancel unclaimed payments

### Story 7: Earning Points for Activity
**As a** Synkio user  
**I want to** earn points for using the platform  
**So that** I feel rewarded for my engagement

**Acceptance Criteria**:
- Points are awarded automatically for transactions
- Points are awarded for referrals
- Points balance is visible in profile
- Points history shows all earning/spending activity

### Story 8: Using Points for Rewards
**As a** Synkio user  
**I want to** spend points on cosmetic rewards  
**So that** I can customize my profile and get early access to features

**Acceptance Criteria**:
- Points can be spent on profile badges and themes
- Points unlock early access to beta features
- Points provide queue priority for support
- Points cannot be used for paid features that cost money

---

## Technical Requirements

### AI Agent Requirements

**Model**: OpenAI GPT-4o-mini

**System Prompt**:
```
You are Synkio, a conversational marketplace and payment assistant. You help users:
- Discover vendors and products
- Send and request payments from anyone
- Manage their custodial wallet and multi-chain balances
- Browse the marketplace
- Make onchain transactions with automatic currency conversion
- Split payments among multiple recipients
- Track and earn points for engagement

Available tools:
- search_vendors: Search vendors by category
- create_escrow: Create escrow for transactions
- release_payment: Release escrowed payments
- send_payment: Send payment to email/phone/username/wallet
- request_payment: Request payment from anyone
- get_wallet_balance: Check multi-chain wallet balance
- fund_wallet: Fund user wallet via Bread or other providers
- file_dispute: File disputes
- get_transaction_status: Check transaction status
- get_payment_history: Get payment history and pending requests
- split_payment: Split payment among multiple recipients
```

**Intent Classification**:
- `search` - Vendor discovery
- `purchase` - Create escrow
- `send_payment` - Send payment to anyone
- `request_payment` - Request payment from anyone
- `wallet` - Wallet operations
- `status` - Transaction status
- `dispute` - Dispute filing
- `vendor` - Vendor registration
- `split_payment` - Split payment among recipients
- `history` - Payment history
- `points` - Points balance and rewards

### Backend API Requirements

**Endpoints**:
- `POST /api/identity/create` - Create user
- `GET /api/identity/:email/wallet/balance` - Get multi-chain balance
- `POST /api/escrow/create` - Create escrow
- `POST /api/escrow/:id/release` - Release payment
- `POST /api/escrow/:id/dispute` - File dispute
- `GET /api/vendors?category=X` - Search vendors
- `GET /api/transactions/:email/:id` - Get transaction
- `POST /api/payment/send` - Send payment (requires password auth)
- `POST /api/payment/request` - Create payment request
- `POST /api/payment/claim` - Claim payment via link
- `GET /api/payment/history` - Get payment history
- `POST /api/payment/split` - Split payment among recipients
- `GET /api/swap/quote` - Get swap quote for currency conversion
- `POST /api/swap/execute` - Execute swap (internal, requires auth)
- `GET /api/points/balance` - Get user points balance and level
- `GET /api/points/history` - Get points transaction history
- `POST /api/points/earn` - Award points (internal, triggered by actions)
- `POST /api/points/spend` - Spend points on rewards (requires auth)

**Database Schema**:
- Users: Email, wallet, profile, reputation, points balance
- Transactions: Escrow ID, parties, amount, status, metadata
- Points: User ID, balance, level, transaction history

### Smart Contract Requirements

**EscrowManager**:
- Create escrow with amount, seller, deadline
- Fund escrow (buyer)
- Release payment (buyer) or milestone release (seller)
- File dispute
- Cancel escrow (buyer, pending only)
- Platform fee: 2.5%

**ReputationRegistry**:
- Update reputation on transaction completion
- Get reputation score (0-1000)
- Track total transactions

**DisputeResolution**:
- File dispute with arbitrator
- Resolve dispute with outcome
- Timeout handling

---

## Channel-Specific Requirements

### WhatsApp (WaSender)

**Webhook Integration**:
- Endpoint: `/api/webhook/whatsapp`
- HMAC SHA-256 signature verification
- Phone number 
- Template message support for transaction updates

**Message Format**:
- Text messages only
- Emoji support for visual feedback
- Structured messages for complex data (escrow details, vendor lists)

### Web Interface

**UI Components**:
- Chat interface with message history
- Wallet balance display (header)
- Quick actions (Find Vendors, Fund Wallet, Browse Marketplace)
- Modal overlays for onboarding and vendor discovery

**Responsive Design**:
- Mobile-first approach
- Desktop: Sidebar chat, modal overlays
- Tablet: Stacked layout

### Farcaster Mini App

**MiniKit Configuration**:
- Manifest file for Farcaster integration
- Webhook URL for cast interactions
- On-chain profile linking

**Features**:
- Embedded chat in casts
- Transaction casting
- Profile integration with Farcaster identity

---

## Success Metrics

### User Metrics
- User signups (per channel)
- Onboarding completion rate
- Wallet funding success rate
- Active user transactions

### Transaction Metrics
- Escrow creation rate
- Payment release rate
- Dispute rate
- Average transaction size

### Platform Metrics
- Vendor signups
- Vendor transaction volume
- Platform fee collection
- Smart contract gas usage

### Reputation Metrics
- Average reputation score
- Reputation distribution
- High-reputation vendor utilization

---

## Future Enhancements

> **Note**: For detailed current project status, see [PROJECT_STATUS.md](./PROJECT_STATUS.md)

### Phase 1 (Current) - ✅ Complete
- ✅ Multi-channel support (Web, WhatsApp)
- ✅ OpenAI AI agent (GPT-4o-mini)
- ✅ Escrow smart contracts (deployed to Base Sepolia)
- ✅ Reputation system (on-chain)
- ✅ Anonymous-first architecture
- ✅ Custodial wallet management

### Phase 2 (Next 3 months)
- ⏳ Bread Africa integration for fiat on-ramp
- ⏳ Multi-sig wallet support
- ⏳ Advanced dispute resolution with DAO voting
- ⏳ Vendor verification with document upload
- ⏳ Universal payments (send/request to non-users)
- ⏳ Multi-token support (ERC-20)
- ⏳ Points system and gamification

### Phase 3 (6 months)
- ⏳ Mobile apps (iOS/Android)
- ⏳ Farcaster Mini App (full integration)
- ⏳ Subscription-based vendor plans
- ⏳ Analytics dashboard for vendors
- ⏳ Multi-chain support (Ethereum, Solana)

---

## Risk Mitigation

### Security Risks
- **Private key storage**: Encrypted in MongoDB
- **Webhook verification**: HMAC SHA-256
- **Smart contract audits**: Planned for mainnet deployment

### Operational Risks
- **Wallet funding failures**: Multiple fallback options (Bread, Paystack, Flutterwave)
- **High dispute rate**: Automated reputation degradation
- **Smart contract bugs**: Pause mechanism for emergency stops

### Product Risks
- **Low adoption**: Focus on one channel (Farcaster) for early adoption
- **High transaction fees**: Optimize for Base L2 (low fees)
- **User education**: Conversational onboarding with AI guidance

---

## Acceptance Criteria

### MVP (Minimum Viable Product)
- [x] Multi-channel AI agent (WhatsApp, Web)
- [x] Wallet creation and funding
- [x] Escrow creation and release
- [x] Vendor discovery
- [x] Reputation system
- [x] Dispute filing

### V1.0 (Production Ready)
- [ ] Bread africa integration
- [ ] WhatsApp template messages
- [ ] Smart contract audits
- [ ] Comprehensive error handling
- [ ] Analytics dashboard
- [ ] Documentation for vendors
