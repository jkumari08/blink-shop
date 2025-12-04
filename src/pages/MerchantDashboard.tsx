import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import WalletButton from "@/components/WalletButton";
import { Zap, TrendingUp, DollarSign, ArrowUpRight, Wallet, Shield, Globe } from "lucide-react";
import { toast } from "sonner";
import { circleClient, type CircleTransaction, processCirclePayment } from "@/lib/circle-integration";
import { circleAdvancedClient } from "@/lib/circle-advanced";
import { paymentTracker } from "@/lib/anchor-program";
import { useState, useEffect } from "react";

const MerchantDashboard = () => {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [transactions, setTransactions] = useState<CircleTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connected || !publicKey) return;

    const loadMerchantData = async () => {
      try {
        // Get merchant account and balance from Circle
        const account = await circleClient.getMerchantBalance(publicKey.toString());
        setBalance(account.usdcBalance);
        setEarnings(account.totalEarnings);
        setTransactions(account.settlements);
      } catch (error) {
        console.error("Failed to load merchant data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMerchantData();
  }, [connected, publicKey]);

  const handleWithdraw = async () => {
    if (!publicKey) return;

    if (balance < 10) {
      toast.error("Minimum withdrawal is 10 USDC");
      return;
    }

    try {
      await circleClient.initiateSettlement(publicKey.toString(), balance);
      toast.success(
        "Withdrawal initiated! Funds will be transferred to your bank account within 1-2 business days."
      );
      // Refresh data
      const account = await circleClient.getMerchantBalance(publicKey.toString());
      setBalance(account.usdcBalance);
      setTransactions(account.settlements);
    } catch (error) {
      toast.error("Withdrawal failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Earnings Dashboard</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Merchant <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Track your Blink sales and manage USDC settlements via Circle
            </p>
          </div>

          {/* Circle Integration Info Banner */}
          <div className="max-w-4xl mx-auto mb-12 glass rounded-xl p-6 border border-primary/20 animate-slide-up">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Circle Integration Active</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  This merchant dashboard uses Circle's enterprise APIs for seamless USDC payments and settlements:
                </p>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Wallets API</strong>: Secure merchant account management with MPC key protection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Payments Network</strong>: Cross-border USDC transfers with FX quoting and smart routing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Bridge Kit</strong>: Seamless USDC transfers across Solana, Base, and other chains</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          {!connected ? (
            <div className="max-w-2xl mx-auto glass rounded-2xl p-8 text-center animate-slide-up">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your Solana wallet to view your earnings and manage settlements.
              </p>
              <WalletButton />
            </div>
          ) : loading ? (
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Available Balance Card */}
              <div className="glass rounded-xl p-6 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Available Balance</p>
                    <h3 className="font-display text-2xl font-bold text-primary">
                      ${balance.toFixed(2)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">USDC available for withdrawal</p>
                <Button
                  className="w-full mt-4"
                  variant="hero"
                  onClick={handleWithdraw}
                  disabled={balance === 0}
                >
                  Withdraw to Bank
                </Button>
              </div>

              {/* Total Earnings Card */}
              <div className="glass rounded-xl p-6 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Earnings</p>
                    <h3 className="font-display text-2xl font-bold text-accent">
                      ${earnings.toFixed(2)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">All-time USDC earnings</p>
              </div>

              {/* Pending Settlements Card */}
              <div className="glass rounded-xl p-6 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Pending Settlements</p>
                    <h3 className="font-display text-2xl font-bold">
                      {transactions.filter((t) => t.status === "pending").length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Transactions pending confirmation</p>
              </div>
            </div>
          )}

          {/* Transaction History */}
          {connected && transactions.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-xl font-semibold mb-6">Transaction History</h2>
              <div className="glass rounded-xl overflow-hidden animate-slide-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="border-t border-border hover:bg-secondary/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground capitalize">
                            {tx.type}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-primary">
                            +${tx.amount.toFixed(2)} USDC
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tx.status === "completed"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {tx.status === "completed" ? "✓ Completed" : "⏳ Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {connected && transactions.length === 0 && (
            <div className="max-w-2xl mx-auto glass rounded-2xl p-8 text-center animate-slide-up">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">No Transactions Yet</h2>
              <p className="text-muted-foreground mb-6">
                Your USDC payments from Blinks will appear here once customers start buying.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;
