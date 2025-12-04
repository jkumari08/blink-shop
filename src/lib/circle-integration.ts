/**
 * Circle Integration Service
 * Handles USDC settlements and merchant wallet management
 * Using Circle's APIs for production deployments
 */

export interface CircleTransaction {
  id: string;
  type: "payment" | "settlement" | "withdrawal";
  amount: number;
  currency: "USDC";
  status: "pending" | "completed" | "failed";
  timestamp: string;
  blinkId?: string;
  description?: string;
}

interface CircleMerchantAccount {
  id: string;
  walletAddress: string;
  usdcBalance: number;
  totalEarnings: number;
  totalTransactions: number;
  pendingBalance: number;
  settlements: CircleTransaction[];
}

/**
 * Simulated Circle API Client
 * In production, this would call Circle's real APIs at https://api.circle.com
 */
export class CircleClient {
  private apiKey: string;
  private apiBaseUrl = "https://api.circle.com/v1"; // Demo - not actually calling
  private merchantAccounts: Map<string, CircleMerchantAccount> = new Map();
  private transactionHistory: CircleTransaction[] = [];

  constructor(apiKey: string = "test_api_key") {
    this.apiKey = apiKey;
  }

  /**
   * Create or retrieve merchant USDC account with Circle
   */
  async initializeMerchantAccount(walletAddress: string): Promise<CircleMerchantAccount> {
    // Check if account exists
    if (this.merchantAccounts.has(walletAddress)) {
      return this.merchantAccounts.get(walletAddress)!;
    }

    // Create new account
    const account: CircleMerchantAccount = {
      id: `circle_${walletAddress.slice(0, 8)}`,
      walletAddress,
      usdcBalance: 0,
      totalEarnings: 0,
      totalTransactions: 0,
      pendingBalance: 0,
      settlements: [],
    };

    this.merchantAccounts.set(walletAddress, account);
    return account;
  }

  /**
   * Record incoming USDC payment
   */
  async recordPayment(
    merchantWallet: string,
    amountUSDC: number,
    blinkId: string,
    buyerWallet: string
  ): Promise<CircleTransaction> {
    const account = await this.initializeMerchantAccount(merchantWallet);

    const transaction: CircleTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "payment",
      amount: amountUSDC,
      currency: "USDC",
      status: "completed",
      timestamp: new Date().toISOString(),
      blinkId,
      description: `Payment received from ${buyerWallet.slice(0, 8)}...`,
    };

    account.usdcBalance += amountUSDC;
    account.totalEarnings += amountUSDC;
    account.totalTransactions += 1;
    account.pendingBalance += amountUSDC;
    account.settlements.push(transaction);
    this.transactionHistory.push(transaction);

    console.log("Circle Payment Recorded:", transaction);
    return transaction;
  }

  /**
   * Initiate USDC settlement/withdrawal to merchant's bank account
   */
  async initiateSettlement(
    merchantWallet: string,
    amountUSDC: number
  ): Promise<CircleTransaction> {
    const account = this.merchantAccounts.get(merchantWallet);
    if (!account) {
      throw new Error("Merchant account not found");
    }

    if (account.usdcBalance < amountUSDC) {
      throw new Error("Insufficient USDC balance for settlement");
    }

    const settlement: CircleTransaction = {
      id: `settlement_${Date.now()}`,
      type: "settlement",
      amount: amountUSDC,
      currency: "USDC",
      status: "pending",
      timestamp: new Date().toISOString(),
      description: `Settlement to bank account`,
    };

    account.usdcBalance -= amountUSDC;
    account.pendingBalance -= amountUSDC;
    account.settlements.push(settlement);
    this.transactionHistory.push(settlement);

    // In production, this would call Circle's settlement API
    // Simulate completion after 2 seconds
    setTimeout(() => {
      settlement.status = "completed";
    }, 2000);

    return settlement;
  }

  /**
   * Get merchant's USDC balance and account details
   */
  async getMerchantBalance(walletAddress: string): Promise<CircleMerchantAccount> {
    const account = this.merchantAccounts.get(walletAddress);
    if (!account) {
      return this.initializeMerchantAccount(walletAddress);
    }
    return account;
  }

  /**
   * Get transaction history for merchant
   */
  async getTransactionHistory(walletAddress: string): Promise<CircleTransaction[]> {
    const account = this.merchantAccounts.get(walletAddress);
    return account?.settlements || [];
  }

  /**
   * Get all transactions (admin view)
   */
  getAllTransactions(): CircleTransaction[] {
    return this.transactionHistory;
  }

  /**
   * Calculate settlement fees (demo: 1% fee)
   */
  calculateSettlementFee(amountUSDC: number): number {
    return amountUSDC * 0.01; // 1% fee
  }

  /**
   * Verify USDC payment on Solana
   */
  async verifyUSDCPayment(
    transactionHash: string,
    amountUSDC: number,
    merchant: string
  ): Promise<boolean> {
    // In production, would verify against Solana blockchain
    // For demo, just validate the parameters
    return (
      transactionHash.length > 0 &&
      amountUSDC > 0 &&
      merchant.length > 40 // Solana address length
    );
  }
}

// Global Circle client instance
export const circleClient = new CircleClient("test_api_key");

/**
 * Circle Payment Integration Hook
 * Provides high-level payment methods
 */
export interface CirclePaymentDetails {
  merchantWallet: string;
  amountUSDC: number;
  blinkId: string;
  buyerWallet: string;
  transactionHash: string;
}

export const processCirclePayment = async (
  details: CirclePaymentDetails
): Promise<{ success: boolean; transaction?: CircleTransaction; error?: string }> => {
  try {
    // Verify payment on Solana
    const verified = await circleClient.verifyUSDCPayment(
      details.transactionHash,
      details.amountUSDC,
      details.merchantWallet
    );

    if (!verified) {
      return { success: false, error: "Payment verification failed" };
    }

    // Record payment with Circle
    const transaction = await circleClient.recordPayment(
      details.merchantWallet,
      details.amountUSDC,
      details.blinkId,
      details.buyerWallet
    );

    return { success: true, transaction };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
    console.error("Circle Payment Error:", errorMessage);
    return { success: false, error: errorMessage };
  }
};
