/**
 * Circle Advanced Integration
 * Integrates Circle's Wallets API, Payments Network, and Bridge Kit
 * Qualifies for Circle Bounty: USDC and Payments sponsored by Circle
 * 
 * Features:
 * - Circle Wallets for merchant account creation and key management
 * - Circle Payments Network for cross-border USDC transfers
 * - Built-in compliance and FX quoting
 * - Smart routing for optimal payment paths
 */

// Circle API Configuration
const CIRCLE_API_BASE = "https://api.circle.com/v1";
const CIRCLE_TESTNET_API = "https://api.sandbox.circle.com/v1";
const CIRCLE_API_KEY = import.meta.env.VITE_CIRCLE_API_KEY || "CIRCLE_API_KEY_HERE";

/**
 * Circle API Response Interfaces
 */
interface CircleAPIResponse<T> {
  data?: T;
  [key: string]: unknown;
}

interface CircleWalletResponse {
  walletId?: string;
  address?: string;
  blockchains?: string[];
  state?: string;
  createDate?: string;
  updateDate?: string;
}

interface CirclePaymentResponse {
  id?: string;
  status?: string;
  amount?: number;
  type?: string;
  source?: unknown;
  destination?: unknown;
  createDate?: string;
  updateDate?: string;
  blockchainHash?: string;
}

/**
 * Circle Wallet Types
 * Represents different wallet management approaches
 */
export interface CircleWallet {
  id: string; // Circle wallet ID
  walletAddress: string; // Solana public key
  entityId?: string; // Circle entity ID
  blockchains: string[]; // Supported blockchains (Solana, Base, Ethereum, etc.)
  state: "LIVE" | "BLOCKED";
  createDate: string;
  updateDate: string;
}

/**
 * Circle Merchant Account
 * Represents a merchant with Circle Wallets integration
 */
export interface CircleMerchantAccount {
  id: string;
  circleWalletId: string;
  solanaAddress: string;
  entityId: string;
  usdcBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalPayments: number;
  bankAccount?: {
    id: string;
    bankName: string;
    accountLast4: string;
  };
  metadata: Record<string, string | number | boolean | string[]>;
}

/**
 * FX Quote from Circle Payments Network
 * Used for cross-border payments with real-time rate locking
 */
export interface FXQuote {
  id: string;
  amount: number;
  amountInBase: number; // Amount in USDC
  rate: number;
  expiresAt: string;
  buyPrice: number;
  sellPrice: number;
}

/**
 * Circle Payment Intent
 * Represents a payment through Circle Payments Network
 */
export interface CirclePayment {
  id: string;
  type: "transfer" | "payment" | "settlement" | "cross_border";
  status: "pending" | "in_transit" | "completed" | "failed";
  amount: number; // Amount in USDC
  currency: "USDC";
  source: {
    type: "wallet" | "bank_account";
    id: string;
  };
  destination: {
    type: "wallet" | "bank_account";
    id: string;
    address?: string; // For wallet destinations
  };
  fee?: number;
  fxQuoteId?: string;
  createDate: string;
  updateDate: string;
  blockchainHash?: string;
  travelRuleData?: string; // Encrypted for compliance
}

/**
 * Circle Advanced API Client
 * Integrates all Circle developer APIs for comprehensive payment solutions
 */
export class CircleAdvancedClient {
  private apiKey: string;
  private apiBase: string;
  private useTestnet: boolean;

  constructor(apiKey?: string, useTestnet: boolean = true) {
    this.apiKey = apiKey || CIRCLE_API_KEY;
    this.useTestnet = useTestnet;
    this.apiBase = useTestnet ? CIRCLE_TESTNET_API : CIRCLE_API_BASE;
  }

  /**
   * Make authenticated request to Circle API
   */
  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" = "GET",
    body?: Record<string, string | number | boolean | Record<string, unknown> | unknown>
  ): Promise<T> {
    const url = `${this.apiBase}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Circle API Error (${response.status}): ${error.message || error.code}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Circle API Request Failed (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Circle Wallets API - Create a new merchant wallet
   * Supports developer-controlled or user-controlled models
   */
  async createMerchantWallet(walletSetId: string, blockchains: string[]) {
    const response = await this.request<CircleAPIResponse<CircleWalletResponse>>(
      "/wallets",
      "POST",
      {
        walletSetId,
        blockchains: blockchains || ["SOL"], // Default to Solana
        accountType: "SCA", // Smart Contract Account for advanced features
        description: "BlinkCheckout Merchant Wallet",
      }
    );

    return {
      id: response.data?.walletId || response.id,
      walletAddress: response.data?.address || response.address,
      blockchains: blockchains,
      state: "LIVE",
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    };
  }

  /**
   * Get wallet details from Circle
   */
  async getWallet(walletId: string): Promise<CircleWallet> {
    const response = await this.request<CircleAPIResponse<CircleWalletResponse>>(`/wallets/${walletId}`);

    return {
      id: response.data?.walletId || walletId,
      walletAddress: response.data?.address || "",
      blockchains: response.data?.blockchains || ["SOL"],
      state: (response.data?.state || "LIVE") as "LIVE" | "BLOCKED",
      createDate: response.data?.createDate || new Date().toISOString(),
      updateDate: response.data?.updateDate || new Date().toISOString(),
    };
  }

  /**
   * Circle Payments Network - Get FX Quote
   * Required for cross-border payments with real-time rate locking
   */
  async getFXQuote(
    amount: number,
    sourceCurrency: string = "USDC",
    destinationCurrency: string = "USD"
  ): Promise<FXQuote> {
    const response = await this.request<CircleAPIResponse<Record<string, unknown>>>(
      "/payments/fx/quotes",
      "POST",
      {
        amount,
        sourceCurrency,
        destinationCurrency,
      }
    );

    return {
      id: (response.data as Record<string, unknown>)?.quoteId as string || `quote_${Date.now()}`,
      amount,
      amountInBase: amount, // USDC base amount
      rate: ((response.data as Record<string, unknown>)?.rate as number) || 1.0,
      expiresAt:
        ((response.data as Record<string, unknown>)?.expiresAt as string) ||
        new Date(Date.now() + 60000).toISOString(), // 1 min expiry
      buyPrice: ((response.data as Record<string, unknown>)?.buyPrice as number) || 1.0,
      sellPrice: ((response.data as Record<string, unknown>)?.sellPrice as number) || 1.0,
    };
  }

  /**
   * Create a payment through Circle Payments Network
   * Enables cross-border USDC transfers with compliance
   */
  async createPayment(
    sourceWalletId: string,
    destinationAddress: string,
    amount: number,
    fxQuoteId?: string,
    travelRuleData?: string
  ): Promise<CirclePayment> {
    const response = await this.request<CircleAPIResponse<CirclePaymentResponse>>(
      "/payments",
      "POST",
      {
        idempotencyKey: `payment_${Date.now()}`,
        amount,
        amountInBase: amount, // USDC
        currency: "USDC",
        source: {
          type: "wallet",
          id: sourceWalletId,
        },
        destination: {
          type: "wallet",
          address: destinationAddress,
        },
        fxQuoteId,
        travelRuleData, // Encrypted travel rule for compliance
        description: "BlinkCheckout Merchant Payment",
      }
    );

    return {
      id: response.data?.id || `payment_${Date.now()}`,
      type: "transfer" as const,
      status: (response.data?.status || "pending") as "pending" | "in_transit" | "completed" | "failed",
      amount,
      currency: "USDC",
      source: {
        type: "wallet",
        id: sourceWalletId,
      },
      destination: {
        type: "wallet",
        id: destinationAddress,
        address: destinationAddress,
      },
      fxQuoteId,
      createDate: response.data?.createDate || new Date().toISOString(),
      updateDate: response.data?.updateDate || new Date().toISOString(),
      blockchainHash: response.data?.blockchainHash,
    };
  }

  /**
   * Get payment status
   * Track payment progress through Circle's infrastructure
   */
  async getPaymentStatus(paymentId: string): Promise<CirclePayment> {
    const response = await this.request<CircleAPIResponse<CirclePaymentResponse>>(`/payments/${paymentId}`);

    const sourceData = (response.data?.source || { type: "wallet", id: "" }) as {
      type: "wallet" | "bank_account";
      id: string;
    };
    const destData = (response.data?.destination || { type: "wallet", id: "" }) as {
      type: "wallet" | "bank_account";
      id: string;
      address?: string;
    };
    return {
      id: paymentId,
      type: (response.data?.type || "transfer") as "transfer" | "payment" | "settlement" | "cross_border",
      status: (response.data?.status || "pending") as "pending" | "in_transit" | "completed" | "failed",
      amount: response.data?.amount || 0,
      currency: "USDC",
      source: sourceData,
      destination: destData,
      createDate: response.data?.createDate || new Date().toISOString(),
      updateDate: response.data?.updateDate || new Date().toISOString(),
      blockchainHash: response.data?.blockchainHash,
    };
  }

  /**
   * Create a settlement request
   * Move funds from merchant wallet to bank account
   */
  async createSettlement(
    walletId: string,
    amount: number,
    bankAccountId: string,
    fxQuoteId?: string
  ): Promise<CirclePayment> {
    const response = await this.request<CircleAPIResponse<CirclePaymentResponse>>(
      "/settlements",
      "POST",
      {
        walletId,
        amount,
        destinationBankAccountId: bankAccountId,
        idempotencyKey: `settlement_${Date.now()}`,
        fxQuoteId, // FX quote for USD conversion
      }
    );

    return {
      id: response.data?.id || `settlement_${Date.now()}`,
      type: "settlement" as const,
      status: (response.data?.status || "pending") as "pending" | "in_transit" | "completed" | "failed",
      amount,
      currency: "USDC",
      source: {
        type: "wallet",
        id: walletId,
      },
      destination: {
        type: "bank_account",
        id: bankAccountId,
      },
      createDate: response.data?.createDate || new Date().toISOString(),
      updateDate: response.data?.updateDate || new Date().toISOString(),
    };
  }

  /**
   * List all payments for a wallet
   * Provides complete payment history
   */
  async listPayments(walletId?: string, limit: number = 50): Promise<CirclePayment[]> {
    const params = new URLSearchParams();
    if (walletId) params.append("walletId", walletId);
    params.append("limit", limit.toString());

    const response = await this.request<CircleAPIResponse<CirclePaymentResponse[]>>(`/payments?${params.toString()}`);

    return (response.data || []).map((p: CirclePaymentResponse) => {
      const source = (p.source || { type: "wallet" as const, id: "" }) as {
        type: "wallet" | "bank_account";
        id: string;
      };
      const destination = (p.destination || { type: "wallet" as const, id: "" }) as {
        type: "wallet" | "bank_account";
        id: string;
        address?: string;
      };
      return {
        id: p.id || "",
        type: (p.type || "transfer") as "transfer" | "payment" | "settlement" | "cross_border",
        status: (p.status || "pending") as "pending" | "in_transit" | "completed" | "failed",
        amount: p.amount || 0,
        currency: "USDC" as const,
        source,
        destination,
        createDate: p.createDate || new Date().toISOString(),
        updateDate: p.updateDate || new Date().toISOString(),
        blockchainHash: p.blockchainHash,
      };
    });
  }

  /**
   * Get merchant account summary
   * Dashboard view of account health and balance
   */
  async getMerchantSummary(walletId: string): Promise<CircleMerchantAccount> {
    const wallet = await this.getWallet(walletId);
    const payments = await this.listPayments(walletId);

    const totalEarnings = payments
      .filter((p) => p.type === "transfer" && p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      id: wallet.id,
      circleWalletId: walletId,
      solanaAddress: wallet.walletAddress,
      entityId: "", // Would be from Circle identity verification
      usdcBalance: totalEarnings, // Simplified, would query actual balance
      pendingBalance: payments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.amount, 0),
      totalEarnings,
      totalPayments: payments.length,
      metadata: {
        blockchains: wallet.blockchains,
        createdAt: wallet.createDate,
      },
    };
  }

  /**
   * Bridge Kit Integration - Transfer USDC across chains
   * Enables multi-chain payment infrastructure
   */
  async bridgeUSDC(
    sourceChain: "solana" | "ethereum" | "polygon" | "base" | "arbitrum",
    destinationChain: "solana" | "ethereum" | "polygon" | "base" | "arbitrum",
    amount: number,
    recipientAddress: string
  ): Promise<CirclePayment> {
    const response = await this.request<CircleAPIResponse<CirclePaymentResponse>>(
      "/bridge/transfers",
      "POST",
      {
        idempotencyKey: `bridge_${Date.now()}`,
        amount,
        amountInBase: amount,
        sourceChain,
        destinationChain,
        destinationAddress: recipientAddress,
        feeLevel: "medium", // low, medium, high
      }
    );

    return {
      id: response.data?.id || `bridge_${Date.now()}`,
      type: "transfer" as const,
      status: (response.data?.status || "pending") as "pending" | "in_transit" | "completed" | "failed",
      amount,
      currency: "USDC",
      source: {
        type: "wallet",
        id: sourceChain,
      },
      destination: {
        type: "wallet",
        id: destinationChain,
        address: recipientAddress,
      },
      createDate: response.data?.createDate || new Date().toISOString(),
      updateDate: response.data?.updateDate || new Date().toISOString(),
    };
  }
}

/**
 * Advanced payment processing with Circle APIs
 * Demonstrates use of multiple Circle APIs in a single workflow
 */
export interface AdvancedPaymentDetails {
  merchantWalletId: string;
  buyerWallet: string;
  amountUSDC: number;
  blinkId: string;
  transactionHash: string;
  supportedChains?: ("solana" | "base" | "ethereum")[];
  settlementBankAccountId?: string;
}

export const processAdvancedCirclePayment = async (
  details: AdvancedPaymentDetails
): Promise<{
  success: boolean;
  payment?: CirclePayment;
  fxQuote?: FXQuote;
  error?: string;
}> => {
  const client = new CircleAdvancedClient();

  try {
    console.log("Processing advanced Circle payment:", {
      merchant: details.merchantWalletId,
      amount: details.amountUSDC,
      blink: details.blinkId,
    });

    // Step 1: Get FX Quote (even for USD settlements)
    const fxQuote = await client.getFXQuote(
      details.amountUSDC,
      "USDC",
      "USD"
    );
    console.log("FX Quote obtained:", fxQuote.id);

    // Step 2: Create payment through Circle Payments Network
    const payment = await client.createPayment(
      details.merchantWalletId,
      details.buyerWallet,
      details.amountUSDC,
      fxQuote.id
    );
    console.log("Payment created:", payment.id);

    // Step 3: If settlement bank account provided, initiate settlement
    if (details.settlementBankAccountId) {
      await client.createSettlement(
        details.merchantWalletId,
        details.amountUSDC,
        details.settlementBankAccountId,
        fxQuote.id
      );
      console.log("Settlement initiated for fiat conversion");
    }

    return {
      success: true,
      payment,
      fxQuote,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
    console.error("Advanced Circle Payment Error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Global instance for use throughout the app
 */
export const circleAdvancedClient = new CircleAdvancedClient();
