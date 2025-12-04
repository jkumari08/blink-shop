import { useCallback, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
import { toast } from "sonner";

export type TokenType = "SOL" | "USDC" | "USDT";

export interface MultiTokenConfig {
  token: TokenType;
  amount: number;
  recipientAddress: string;
  reference?: string;
}

/**
 * Multi-token support for Solana payments
 * Supports SOL, USDC, and USDT with automatic routing
 */
export const useMultiTokenTransaction = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Token mint addresses - memoized to prevent re-renders
  const TOKEN_MINTS = useMemo(
    () => ({
      SOL: "native", // Native SOL (uses system program)
      USDC: "EPjFWaLb3odccccccccccccccccccccccccPEKjAxm", // Circle USDC on mainnet
      USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEqw", // USDT on mainnet
    }),
    []
  );

  /**
   * Send a multi-token transaction
   */
  const sendMultiTokenTransaction = useCallback(
    async (config: MultiTokenConfig): Promise<string | null> => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      try {
        const transaction = new Transaction();
        const recipient = new PublicKey(config.recipientAddress);

        if (config.token === "SOL") {
          // SOL transfer (native)
          const lamports = Math.floor(config.amount * LAMPORTS_PER_SOL);
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipient,
              lamports,
            })
          );
        } else {
          // SPL Token transfer (USDC or USDT)
          const mintAddress = new PublicKey(TOKEN_MINTS[config.token]);
          
          try {
            // Get associated token accounts
            const senderTokenAccount = await getAssociatedTokenAddress(
              mintAddress,
              publicKey
            );
            const recipientTokenAccount = await getAssociatedTokenAddress(
              mintAddress,
              recipient
            );

            // Convert decimal amount to token units (6 decimals for USDC/USDT)
            const tokenAmount = Math.floor(config.amount * 1_000_000);

            // Create transfer instruction
            transaction.add(
              createTransferInstruction(
                senderTokenAccount,
                recipientTokenAccount,
                publicKey,
                tokenAmount
              )
            );
          } catch (error) {
            console.error(`Error setting up ${config.token} transfer:`, error);
            throw new Error(
              `Could not transfer ${config.token}. Make sure you have ${config.token} in your wallet.`
            );
          }
        }

        // Get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Send transaction
        const signature = await sendTransaction(transaction, connection);

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, "confirmed");
        
        if (confirmation.value.err) {
          throw new Error("Transaction failed");
        }

        return signature;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Multi-token transaction error:", errorMessage);
        throw error;
      }
    },
    [publicKey, connection, sendTransaction, TOKEN_MINTS]
  );

  /**
   * Get token symbol and decimals
   */
  const getTokenInfo = (token: TokenType) => {
    const info: Record<TokenType, { symbol: string; decimals: number; icon: string }> = {
      SOL: {
        symbol: "SOL",
        decimals: 9,
        icon: "◎",
      },
      USDC: {
        symbol: "USDC",
        decimals: 6,
        icon: "💵",
      },
      USDT: {
        symbol: "USDT",
        decimals: 6,
        icon: "₮",
      },
    };
    return info[token];
  };

  /**
   * Format token amount for display
   */
  const formatTokenAmount = (amount: number, token: TokenType): string => {
    const info = getTokenInfo(token);
    return `${amount.toFixed(2)} ${info.symbol}`;
  };

  /**
   * Convert between tokens (simplified rates for demo)
   * In production, would use real exchange rates
   */
  const convertToken = (
    amount: number,
    fromToken: TokenType,
    toToken: TokenType
  ): number => {
    // Demo rates (in production, use real pricing from Circle or DEX)
    const rates: Record<TokenType, number> = {
      SOL: 1, // Base rate
      USDC: 145, // ~145 USDC per SOL
      USDT: 145, // ~145 USDT per SOL
    };

    const inSOL = amount / rates[fromToken];
    return inSOL * rates[toToken];
  };

  /**
   * Get all supported tokens
   */
  const getSupportedTokens = (): TokenType[] => ["SOL", "USDC", "USDT"];

  return {
    sendMultiTokenTransaction,
    getTokenInfo,
    formatTokenAmount,
    convertToken,
    getSupportedTokens,
  };
};
