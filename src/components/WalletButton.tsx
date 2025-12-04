import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

const WalletButton: React.FC = () => {
  const { connected } = useWallet();

  if (connected) {
    return <WalletMultiButton />;
  }

  return (
    <WalletMultiButton>
      <Wallet className="w-4 h-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </WalletMultiButton>
  );
};

export default WalletButton;
