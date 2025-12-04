import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { toast } from "sonner";

// USDC Mint address on Devnet
// This is a placeholder - will be replaced with actual USDC mint
const USDC_MINT = "EPjFWdd5Au17utZsteu5VYhUTjsrCr0EZ3T5KxMucjH";

export const useUSDCTransaction = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const sendUSDCTransaction = async ({
    recipientAddress,
    amountUSDC,
    reference,
  }: {
    recipientAddress: string;
    amountUSDC: number;
    reference?: string;
  }): Promise<string | null> => {
    try {
      if (!publicKey || !sendTransaction) {
        throw new Error("Wallet not connected");
      }

      // For now, this is a mock implementation showing the transaction intent
      // In production, this will use @solana/spl-token for real USDC transfers
      const recipient = new PublicKey(recipientAddress);
      
      // Create a transaction that logs the USDC transfer intent
      const transaction = new Transaction();

      // Send a small amount of SOL as a placeholder
      // This will be replaced with actual USDC token transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: 100000, // 0.0001 SOL as placeholder
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "processed");

      // Log the transaction details for merchant reference
      console.log("USDC Payment Intent:", {
        merchant: recipientAddress,
        amount: amountUSDC,
        currency: "USDC",
        transactionHash: signature,
        reference: reference,
        timestamp: new Date().toISOString(),
      });

      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "USDC transaction failed";
      console.error("USDC Transaction Error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    sendUSDCTransaction,
  };
};
