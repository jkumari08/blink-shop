// Anchor Program Interface for BlinkShop Payment Processor
// This file defines the contract structure for on-chain blink validation

import { PublicKey } from "@solana/web3.js";

/**
 * Blink Payment State stored on-chain
 * Used to verify and track payments made through blinks
 */
export interface BlinkPaymentState {
  blinkId: string;
  merchant: PublicKey;
  productName: string;
  priceUSDC: number;
  createdAt: number;
  totalSales: number;
  totalRevenue: number;
  isActive: boolean;
}

/**
 * Payment Transaction Record stored on-chain
 * Provides immutable record of each payment
 */
export interface PaymentTransaction {
  blinkId: string;
  buyer: PublicKey;
  merchant: PublicKey;
  amountUSDC: number;
  transactionHash: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

/**
 * Simulated Anchor Program Instructions
 * These would normally be called via Anchor client
 */
export const BlinkPaymentProgram = {
  // Program ID (would be deployed to Solana)
  programId: new PublicKey("11111111111111111111111111111111"),

  // Instruction to create a new blink on-chain
  createBlink: async (
    merchant: PublicKey,
    blinkId: string,
    productName: string,
    priceUSDC: number
  ) => {
    return {
      instruction: "CreateBlink",
      merchant,
      blinkId,
      productName,
      priceUSDC,
      timestamp: Math.floor(Date.now() / 1000),
    };
  },

  // Instruction to record a payment
  recordPayment: async (
    blinkId: string,
    buyer: PublicKey,
    merchant: PublicKey,
    amountUSDC: number,
    transactionHash: string
  ) => {
    return {
      instruction: "RecordPayment",
      blinkId,
      buyer,
      merchant,
      amountUSDC,
      transactionHash,
      timestamp: Math.floor(Date.now() / 1000),
      status: "confirmed",
    };
  },

  // Instruction to update blink status
  updateBlinkStatus: async (blinkId: string, isActive: boolean) => {
    return {
      instruction: "UpdateBlinkStatus",
      blinkId,
      isActive,
      timestamp: Math.floor(Date.now() / 1000),
    };
  },
};

/**
 * Off-chain tracking of payments pending on-chain confirmation
 * This simulates the Anchor program state until full deployment
 */
export class BlinkPaymentTracker {
  private blinks: Map<string, BlinkPaymentState> = new Map();
  private transactions: PaymentTransaction[] = [];

  createBlink(
    blinkId: string,
    merchant: PublicKey,
    productName: string,
    priceUSDC: number
  ): BlinkPaymentState {
    const blink: BlinkPaymentState = {
      blinkId,
      merchant,
      productName,
      priceUSDC,
      createdAt: Math.floor(Date.now() / 1000),
      totalSales: 0,
      totalRevenue: 0,
      isActive: true,
    };
    this.blinks.set(blinkId, blink);
    return blink;
  }

  recordPayment(
    blinkId: string,
    buyer: PublicKey,
    merchant: PublicKey,
    amountUSDC: number,
    transactionHash: string
  ): PaymentTransaction {
    const transaction: PaymentTransaction = {
      blinkId,
      buyer,
      merchant,
      amountUSDC,
      transactionHash,
      timestamp: Math.floor(Date.now() / 1000),
      status: "confirmed",
    };

    this.transactions.push(transaction);

    // Update blink stats
    const blink = this.blinks.get(blinkId);
    if (blink) {
      blink.totalSales += 1;
      blink.totalRevenue += amountUSDC;
    }

    return transaction;
  }

  getBlink(blinkId: string): BlinkPaymentState | undefined {
    return this.blinks.get(blinkId);
  }

  getMerchantTransactions(merchant: PublicKey): PaymentTransaction[] {
    return this.transactions.filter(
      (tx) => tx.merchant.toString() === merchant.toString()
    );
  }

  getBlinkTransactions(blinkId: string): PaymentTransaction[] {
    return this.transactions.filter((tx) => tx.blinkId === blinkId);
  }

  getAllTransactions(): PaymentTransaction[] {
    return this.transactions;
  }
}

// Global payment tracker instance
export const paymentTracker = new BlinkPaymentTracker();
