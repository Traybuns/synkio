import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mini App catalog
const miniApps = {
  vendors: {
    url: `${process.env.NEXT_PUBLIC_ROOT_URL}/vendors`,
    description: "🛍️ Discover vendors and make purchases",
    triggers: ['shop', 'buy', 'vendor', 'store', 'marketplace']
  },
  marketplace: {
    url: `${process.env.NEXT_PUBLIC_ROOT_URL}/marketplace`,
    description: "🏪 Browse the marketplace",
    triggers: ['browse', 'marketplace', 'products', 'catalog']
  },
  wallet: {
    url: `${process.env.NEXT_PUBLIC_ROOT_URL}/wallet`,
    description: "💰 Manage your wallet and payments",
    triggers: ['wallet', 'fund', 'pay', 'balance', 'money']
  }
};

function detectMiniAppContext(message: string): string | null {
  const content = message.toLowerCase();
  
  for (const [key, app] of Object.entries(miniApps)) {
    if (app.triggers.some(trigger => content.includes(trigger))) {
      return key;
    }
  }
  
  return null;
}

function extractEntities(message: string): {
  products?: string[];
  vendors?: string[];
  amounts?: string[];
  categories?: string[];
  intents?: string[];
} {
  const entities: {
    products?: string[];
    vendors?: string[];
    amounts?: string[];
    categories?: string[];
    intents?: string[];
  } = {};
  
  const lowerMessage = message.toLowerCase();
  
  const categoryKeywords = ['electronics', 'clothing', 'food', 'services', 'digital', 'art', 'collectibles', 'automotive', 'home', 'beauty', 'sports'];
  const foundCategories = categoryKeywords.filter(cat => lowerMessage.includes(cat));
  if (foundCategories.length > 0) {
    entities.categories = foundCategories;
  }
  
  const amountPattern = /\$?\d+(\.\d+)?\s*(eth|usd|usdc|weth|dollars?|dollar)/gi;
  const amounts = message.match(amountPattern);
  if (amounts) {
    entities.amounts = amounts;
  }
  
  const intentKeywords = {
    purchase: ['buy', 'purchase', 'order', 'get', 'want'],
    search: ['find', 'search', 'look for', 'show me', 'browse'],
    wallet: ['balance', 'wallet', 'fund', 'send', 'pay'],
    status: ['status', 'check', 'track', 'where is']
  };
  
  const foundIntents: string[] = [];
  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      foundIntents.push(intent);
    }
  }
  if (foundIntents.length > 0) {
    entities.intents = foundIntents;
  }
  
  return entities;
}

function buildContext(conversationHistory: Array<{ role: string; content: string }>, currentMessage: string): {
  currentIntent?: string;
  activeTransaction?: string;
  lastProductSearched?: string;
  entities: ReturnType<typeof extractEntities>;
} {
  const entities = extractEntities(currentMessage);
  const context: {
    currentIntent?: string;
    activeTransaction?: string;
    lastProductSearched?: string;
    entities: ReturnType<typeof extractEntities>;
  } = { entities };
  
  if (entities.intents && entities.intents.length > 0) {
    context.currentIntent = entities.intents[0];
  }
  
  for (const msg of conversationHistory.slice().reverse()) {
    if (msg.role === 'assistant' && msg.content.includes('escrow')) {
      const escrowMatch = msg.content.match(/escrow[:\s]+(\d+)/i);
      if (escrowMatch) {
        context.activeTransaction = escrowMatch[1];
        break;
      }
    }
    
    if (msg.role === 'user' && (msg.content.includes('product') || msg.content.includes('search'))) {
      const productMatch = msg.content.match(/product[:\s]+([^\n]+)/i);
      if (productMatch) {
        context.lastProductSearched = productMatch[1].trim();
        break;
      }
    }
  }
  
  return context;
}

async function callBackendTool(tool: string, params: any, userEmail?: string) {
  const backendUrl = process.env.BACKEND_SERVICE_URL || 'http://localhost:4000';
  
  switch (tool) {
    case 'search_vendors':
      const vendorResponse = await fetch(`${backendUrl}/api/vendors?category=${params.category || ''}&minReputation=${params.minReputation || 0}`);
      return await vendorResponse.json();
    
    case 'create_vendor':
      const createVendorResponse = await fetch(`${backendUrl}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'temp@example.com',
          profile: {
            name: params.name,
            bio: params.bio,
            categories: params.categories || [],
            location: params.location,
            website: params.website
          },
          consentGiven: true
        })
      });
      return await createVendorResponse.json();
    
    case 'create_escrow':
      const escrowResponse = await fetch(`${backendUrl}/api/escrow/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          buyerEmail: userEmail || params.buyerEmail
        })
      });
      return await escrowResponse.json();
    
    case 'check_reputation':
      const reputationResponse = await fetch(`${backendUrl}/api/reputation/${params.userAddress}`);
      return await reputationResponse.json();
    
    case 'release_payment':
      const releaseResponse = await fetch(`${backendUrl}/api/escrow/${params.escrowId}/release`, {
        method: 'POST'
      });
      return await releaseResponse.json();
    
    case 'file_dispute':
      const disputeResponse = await fetch(`${backendUrl}/api/escrow/${params.escrowId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: params.reason,
          evidence: params.evidence || []
        })
      });
      return await disputeResponse.json();
    
    case 'get_transaction_status':
      const transactionResponse = await fetch(`${backendUrl}/api/transactions/${userEmail || params.email}/${params.transactionId}`);
      return await transactionResponse.json();
    
    case 'fund_wallet':
      const fundResponse = await fetch(`${backendUrl}/api/identity/${userEmail}/wallet/balance`);
      const fundData = await fundResponse.json();
      return {
        success: true,
        data: {
          walletAddress: fundData.data?.walletAddress,
          balance: fundData.data?.balance,
          currency: fundData.data?.currency,
          network: fundData.data?.network,
          fundingInstructions: {
            network: fundData.data?.network?.name || 'Base Sepolia',
            chainId: fundData.data?.network?.chainId || 84532,
            token: 'ETH',
            note: `Make sure you're sending on the ${fundData.data?.network?.name || 'Base Sepolia'} testnet`
          }
        }
      };
    
    case 'get_wallet_balance':
      if (userEmail) {
        try {
          const balanceResponse = await fetch(`${backendUrl}/api/identity/${userEmail}/wallet/balance`);
          const balanceData = await balanceResponse.json();
          
          if (!balanceData.success && balanceData.error) {
            const errorMessage = balanceData.error.toLowerCase();
            if (errorMessage.includes('decryption') || 
                errorMessage.includes('encryption') || 
                errorMessage.includes('password hash') ||
                errorMessage.includes('encryption_key')) {
              return {
                success: false,
                error: 'Unable to access wallet at this time. Please try again later or contact support if the issue persists.'
              };
            }
          }
          
          return balanceData;
        } catch (error: any) {
          return {
            success: false,
            error: 'Unable to retrieve wallet balance at this time. Please try again later.'
          };
        }
      }
      // Mock wallet balance for now
      return { balance: '0.5 ETH', address: '0x123...' };
    
    case 'submit_feedback':
      const sanitizedFeedbackMessage = params.message ? sanitizeString(params.message) : params.message;
      if (!sanitizedFeedbackMessage || sanitizedFeedbackMessage.trim().length === 0) {
        return {
          success: false,
          error: 'Feedback message is required and cannot be empty'
        };
      }
      const feedbackResponse = await fetch(`${backendUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          message: sanitizedFeedbackMessage,
          rating: params.rating,
          channel: params.channel || 'web'
        })
      });
      return await feedbackResponse.json();
    
    case 'search_products':
      const productSearchParams = new URLSearchParams();
      if (params.category) productSearchParams.append('category', params.category);
      if (params.search) productSearchParams.append('search', params.search);
      if (params.status) productSearchParams.append('status', params.status);
      productSearchParams.append('page', (params.page || 1).toString());
      productSearchParams.append('limit', (params.limit || 20).toString());
      
      const productSearchResponse = await fetch(`${backendUrl}/api/products?${productSearchParams.toString()}`);
      return await productSearchResponse.json();
    
    case 'get_product':
      const productResponse = await fetch(`${backendUrl}/api/products/${params.productId}`);
      return await productResponse.json();
    
    default:
      return { error: 'Unknown tool' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, senderAddress, conversationId, channel, userEmail } = await request.json();

    // Check if we should share a Mini App
    const miniAppKey = detectMiniAppContext(message);
    
    // Fetch conversation history if conversationId is provided
    let conversationHistory: Array<{ role: string; content: string }> = [];
    let conversationContext: any = {};
    if (conversationId) {
      try {
        const backendUrl = process.env.BACKEND_SERVICE_URL || 'http://localhost:4000';
        const convResponse = await fetch(`${backendUrl}/api/conversations/${conversationId}/history?limit=20`);
        if (convResponse.ok) {
          const convData = await convResponse.json();
          if (convData.success && convData.data?.messages) {
            conversationHistory = convData.data.messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            }));
            conversationContext = convData.data.context || {};
          }
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      }
    }
    
    // Build context from conversation history and current message
    const extractedContext = buildContext(conversationHistory, message);
    const fullContext = { ...conversationContext, ...extractedContext };
    
    // Create system prompt for the AI agent
    const isAuthenticated = !!userEmail;
    const contextInfo = [
      fullContext.currentIntent ? `Current Intent: ${fullContext.currentIntent}` : '',
      fullContext.activeTransaction ? `Active Transaction: Escrow ${fullContext.activeTransaction}` : '',
      fullContext.lastProductSearched ? `Last Product Searched: ${fullContext.lastProductSearched}` : '',
      fullContext.entities?.categories ? `Detected Categories: ${fullContext.entities.categories.join(', ')}` : '',
      fullContext.entities?.amounts ? `Detected Amounts: ${fullContext.entities.amounts.join(', ')}` : ''
    ].filter(Boolean).join('\n');
    
    const systemPrompt = `You are Synkio, a conversational marketplace assistant powered by AI. Your mission is to make commerce conversational and onchain accessible to everyone.

CORE PRINCIPLES:
- Conversations come first, UI is optional
- Be helpful, friendly, and natural in your responses
- Support multi-channel: WhatsApp, Web, Farcaster
- Maintain context across conversation turns
- Guide users through multi-step flows naturally

User Context: ${userEmail ? `Current user: ${userEmail} (Authenticated)` : 'No user authenticated - anonymous browsing'}
Channel: ${channel || 'web'}
${contextInfo ? `\n${contextInfo}` : ''}

IMPORTANT AUTHENTICATION RULES:
${!isAuthenticated ? '- User is not authenticated. They can browse vendors, products, and get information, but cannot make purchases, access wallet operations, or create escrows. Inform them they need to sign in first.' : '- User is authenticated. They can access all features including purchases, wallet management, and transactions.'}

Available tools:
- search_vendors: Search for vendors by category and reputation (available to all users)
- search_products: Search for products by category, name, or description (available to all users)
- get_product: Get detailed information about a specific product (available to all users)
- create_escrow: Create escrow for marketplace/service transactions (REQUIRES AUTHENTICATION)
- check_reputation: Verify seller/buyer reputation before transactions (REQUIRES AUTHENTICATION)
- release_payment: Release escrowed payments to sellers (REQUIRES AUTHENTICATION)
- file_dispute: File disputes for unresolved transactions (REQUIRES AUTHENTICATION)
- get_transaction_status: Check transaction status and timeline (REQUIRES AUTHENTICATION)
- get_wallet_balance: Get user's wallet balance (REQUIRES AUTHENTICATION)
- fund_wallet: Get wallet funding information and address (REQUIRES AUTHENTICATION)
- create_vendor: Create a new vendor profile (REQUIRES AUTHENTICATION)
- submit_feedback: Submit feedback or suggestions (available to all users)

CONVERSATION STYLE:
- Be conversational and natural, not robotic
- Ask clarifying questions when needed
- Remember context from previous messages
- Guide users through multi-step processes step by step
- Provide helpful explanations for blockchain/onchain concepts
- Use emojis sparingly and appropriately

ERROR HANDLING:
- If a tool call fails, explain what went wrong in user-friendly terms
- Suggest alternatives when possible
- NEVER expose technical error details to users, especially:
  * Never mention "decryption", "encryption", "ENCRYPTION_KEY", "password hash", or any cryptographic terms
  * Never reveal system errors, stack traces, or internal implementation details
  * Never mention specific error codes or technical error messages
- For wallet-related errors, use generic messages like:
  * "I'm having trouble accessing your wallet right now. Please try again later or contact support if the issue persists."
  * "There was an issue retrieving your wallet information. Please try again in a moment."
- Always keep error messages brief, helpful, and non-technical

If a user asks about vendors, shopping, or marketplace, you can use search_vendors or search_products.
If a user asks about a specific product, use get_product.
${!isAuthenticated ? 'If a user wants to make a purchase, access wallet, or perform transactions, politely inform them they need to sign in first. Guide them to sign up if they are new.' : 'If a user wants to make a purchase or book a service, you can use create_escrow.'}
If a user asks about their wallet or balance, and they are not authenticated, inform them they need to sign in.
If a user wants to fund their wallet or get funding instructions, they must be authenticated.
If a user wants to check transaction status, they must be authenticated.
If a user wants to become a vendor, they must be authenticated.

VENDOR INFORMATION FORMATTING:
When presenting vendor information from search_vendors results, ALWAYS format it using this exact structure:
- Name: [vendor name]
- Location: [location]
- Reputation Score: [score] (with [total] total transactions and [disputes] disputes)
- Website: [Visit Vendor Name]([url])

If there are no disputes, say "no disputes" instead of "0 disputes".
Always include all available information from the vendor data in this structured format.
Do not use markdown bold formatting (**) in vendor information.

Be helpful, friendly, and focused on marketplace activities.`;

    // Handle tool calls with authentication check
    const callBackendToolWithAuth = async (toolName: string, params: any, userEmail?: string) => {
      const authenticatedTools = ['create_escrow', 'release_payment', 'file_dispute', 'get_transaction_status', 
                                  'get_wallet_balance', 'fund_wallet', 'create_vendor', 'check_reputation'];
      
      if (authenticatedTools.includes(toolName) && !userEmail) {
        return {
          error: 'AUTHENTICATION_REQUIRED',
          message: 'You need to sign in to perform this action. Please sign in or create an account first.'
        };
      }
      
      return await callBackendTool(toolName, params, userEmail);
    };

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        })),
        { role: "user", content: message }
      ],
      temperature: 0.7,
      tools: [
        {
          type: "function",
          function: {
            name: "search_vendors",
            description: "Search for vendors in the marketplace by category and minimum reputation",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "The category to search for (electronics, clothing, food, services, etc.)"
                },
                minReputation: {
                  type: "number",
                  description: "Minimum reputation score (0-1000)"
                }
              }
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_escrow",
            description: "Create escrow for marketplace purchase or service booking",
            parameters: {
              type: "object",
              properties: {
                seller: {
                  type: "string",
                  description: "The seller's wallet address"
                },
                amount: {
                  type: "string",
                  description: "The amount in ETH (e.g., '0.1')"
                },
                tokenAddress: {
                  type: "string",
                  description: "Token address (use '0x0000000000000000000000000000000000000000' for ETH)"
                },
                deadline: {
                  type: "number",
                  description: "Deadline timestamp in seconds"
                },
                buyerEmail: {
                  type: "string",
                  description: "The buyer's email address"
                },
                sellerEmail: {
                  type: "string",
                  description: "The seller's email address"
                },
                metadata: {
                  type: "object",
                  description: "Transaction metadata including title, description, and milestones"
                },
                conversationContext: {
                  type: "object",
                  description: "Conversation context including channel and message history"
                }
              },
              required: ["seller", "amount", "tokenAddress", "deadline", "buyerEmail", "sellerEmail", "metadata", "conversationContext"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "check_reputation",
            description: "Check seller/buyer reputation before transaction",
            parameters: {
              type: "object",
              properties: {
                userAddress: {
                  type: "string",
                  description: "The user's wallet address"
                }
              },
              required: ["userAddress"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "release_payment",
            description: "Release escrowed payment to seller",
            parameters: {
              type: "object",
              properties: {
                escrowId: {
                  type: "string",
                  description: "The escrow ID"
                }
              },
              required: ["escrowId"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "file_dispute",
            description: "File dispute for unresolved transaction",
            parameters: {
              type: "object",
              properties: {
                escrowId: {
                  type: "string",
                  description: "The escrow ID"
                },
                reason: {
                  type: "string",
                  description: "The reason for the dispute"
                },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                  description: "Evidence files or descriptions"
                }
              },
              required: ["escrowId", "reason"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_transaction_status",
            description: "Get transaction status and timeline",
            parameters: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  description: "The user's email address"
                },
                transactionId: {
                  type: "string",
                  description: "The transaction ID"
                }
              },
              required: ["email", "transactionId"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_vendor",
            description: "Create a new vendor profile",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The vendor's business name"
                },
                bio: {
                  type: "string",
                  description: "Description of the vendor's business"
                },
                categories: {
                  type: "array",
                  items: { type: "string" },
                  description: "Business categories (electronics, clothing, food, services, etc.)"
                },
                location: {
                  type: "string",
                  description: "Business location"
                },
                website: {
                  type: "string",
                  description: "Business website URL"
                }
              },
              required: ["name", "bio"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_wallet_balance",
            description: "Get user's wallet balance",
            parameters: {
              type: "object",
              properties: {},
              required: []
            }
          }
        },
        {
          type: "function",
          function: {
            name: "fund_wallet",
            description: "Get wallet funding information and address for the user",
            parameters: {
              type: "object",
              properties: {},
              required: []
            }
          }
        },
        {
          type: "function",
          function: {
            name: "submit_feedback",
            description: "Submit feedback, suggestions, or report issues about the platform",
            parameters: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "The feedback message or suggestion"
                },
                rating: {
                  type: "number",
                  description: "Optional rating from 1 to 5 (1 = poor, 5 = excellent)"
                },
                channel: {
                  type: "string",
                  description: "The channel where feedback is submitted (web or whatsapp)"
                }
              },
              required: ["message"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "search_products",
            description: "Search for products in the marketplace by category, name, or description",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Product category (electronics, clothing, food, services, digital, art, collectibles, automotive, home, beauty, sports)"
                },
                search: {
                  type: "string",
                  description: "Search query to find products by name or description"
                },
                status: {
                  type: "string",
                  description: "Product status filter (draft, active, sold_out, archived). Default is active."
                },
                page: {
                  type: "number",
                  description: "Page number for pagination (default: 1)"
                },
                limit: {
                  type: "number",
                  description: "Number of results per page (default: 20)"
                }
              }
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_product",
            description: "Get detailed information about a specific product by product ID",
            parameters: {
              type: "object",
              properties: {
                productId: {
                  type: "string",
                  description: "The unique product ID"
                }
              },
              required: ["productId"]
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    let responseText = completion.choices[0].message.content || "I'm here to help!";
    let toolResults: any = null;
    let allToolCalls: Array<{ name: string; arguments: any; result: any; id: string }> = [];

    // Handle tool calls
    if (completion.choices[0].message.tool_calls && completion.choices[0].message.tool_calls.length > 0) {
      const toolCalls = completion.choices[0].message.tool_calls;
      const toolResultsMap: Record<string, any> = {};
      
      // Execute all tool calls in parallel
      const toolPromises = toolCalls.map(async (toolCall) => {
        const toolName = toolCall.function.name;
        const toolParams = JSON.parse(toolCall.function.arguments);
        const result = await callBackendToolWithAuth(toolName, toolParams, userEmail);
        toolResultsMap[toolCall.id] = result;
        
        allToolCalls.push({
          name: toolName,
          arguments: toolParams,
          result: result,
          id: toolCall.id
        });
        
        return { toolCall, result };
      });
      
      await Promise.all(toolPromises);
      
      // Get follow-up response with all tool results
      const toolMessages = toolCalls.map(toolCall => ({
        role: "tool" as const,
        content: JSON.stringify(toolResultsMap[toolCall.id]),
        tool_call_id: toolCall.id
      }));
      
      const followUp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory.map(msg => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content
          })),
          { role: "user", content: message },
          { 
            role: "assistant", 
            content: completion.choices[0].message.content,
            tool_calls: toolCalls
          },
          ...toolMessages
        ],
        temperature: 0.7
      });
      
      responseText = followUp.choices[0].message.content || responseText;
      toolResults = toolResultsMap;
    }

    // Extract vendor data from tool results for structured response
    let vendorData: any = null;
    if (toolResults) {
      for (const toolCall of allToolCalls) {
        if (toolCall.name === 'search_vendors' && toolCall.result?.success && toolCall.result?.data?.vendors) {
          const vendors = toolCall.result.data.vendors;
          if (vendors && vendors.length > 0) {
            const firstVendor = vendors[0];
            vendorData = {
              name: firstVendor.profile?.name || firstVendor.name,
              location: firstVendor.profile?.location,
              reputationScore: firstVendor.reputation?.score,
              categories: firstVendor.profile?.categories || [],
              description: firstVendor.profile?.bio,
              walletAddress: firstVendor.walletAddress,
              website: firstVendor.profile?.website,
              totalTransactions: firstVendor.reputation?.totalTransactions,
              disputes: firstVendor.reputation?.disputes || 0
            };
            break;
          }
        }
      }
    }

    // Save messages to conversation if conversationId is provided
    if (conversationId) {
      try {
        const backendUrl = process.env.BACKEND_SERVICE_URL || 'http://localhost:4000';
        
        // Save user message
        await fetch(`${backendUrl}/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: message
          })
        });
        
        // Save assistant response with tool calls (if any)
        await fetch(`${backendUrl}/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'assistant',
            content: responseText,
            toolCalls: allToolCalls.length > 0 ? allToolCalls.map(tc => ({
              name: tc.name,
              arguments: tc.arguments,
              result: tc.result
            })) : []
          })
        });
        
        // Update conversation context
        if (fullContext.currentIntent || fullContext.activeTransaction || fullContext.lastProductSearched) {
          await fetch(`${backendUrl}/api/conversations/${conversationId}/context`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              context: {
                currentIntent: fullContext.currentIntent,
                activeTransaction: fullContext.activeTransaction,
                lastProductSearched: fullContext.lastProductSearched
              }
            })
          });
        }
      } catch (error) {
        console.error('Error saving conversation messages:', error);
      }
    }

    // Prepare response
    const response = {
      response: responseText,
      miniAppShared: !!miniAppKey,
      miniAppUrl: miniAppKey ? miniApps[miniAppKey as keyof typeof miniApps].url : '',
      miniAppType: miniAppKey,
      senderAddress,
      conversationId,
      channel,
      toolResults,
      vendorData
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({
      response: "Sorry, I'm having trouble right now. Please try again.",
      miniAppShared: false,
      miniAppUrl: '',
      miniAppType: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Synkio OpenAI Agent API is running',
    channels: ['whatsapp', 'web', 'farcaster'],
    capabilities: [
      'OpenAI-powered conversational AI',
      'Mini App sharing',
      'Vendor search',
      'Wallet management',
      'Backend tool integration'
    ]
  });
}