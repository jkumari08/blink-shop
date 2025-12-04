import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { toast } from "sonner";

interface SendTransactionParams {
  recipientAddress: string;
  amountSOL: number;
  reference?: string;
}

export const useSolanaTransaction = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const sendSOLTransaction = async ({
    recipientAddress,
    amountSOL,
    reference,
  }: SendTransactionParams): Promise<string | null> => {
    try {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      const recipient = new PublicKey(recipientAddress);
      const lamports = Math.round(amountSOL * LAMPORTS_PER_SOL);

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // Add instruction to send SOL
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports,
        })
      );

      // Sign and send transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      await connection.confirmTransaction(signature, "processed");

      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";
      console.error("Transaction error:", errorMessage);
      throw error;
    }
  };

  const sendUSDCTransaction = async ({
    recipientAddress,
    amount,
  }: {
    recipientAddress: string;
    amount: number;
  }): Promise<string | null> => {
    try {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      // For USDC, you would typically use the SPL Token program
      // This is a placeholder - actual implementation would use @solana/spl-token
      console.log(`USDC transaction: ${amount} to ${recipientAddress}`);
      
      // For now, show a message that this would be handled by wallet
      toast.info("USDC payment would be processed via your wallet");
      return null;
    } catch (error) {
      console.error("USDC transaction error:", error);
      throw error;
    }
  };

  return {
    sendSOLTransaction,
    sendUSDCTransaction,
  };
};
