import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Wallet, Zap, Loader, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useUSDCTransaction } from "@/hooks/useUSDCTransaction";
import { useMultiTokenTransaction, type TokenType } from "@/hooks/useMultiTokenTransaction";
import { processCirclePayment } from "@/lib/circle-integration";
import { processAdvancedCirclePayment } from "@/lib/circle-advanced";
import { paymentTracker } from "@/lib/anchor-program";

interface BlinkPreviewProps {
  productName: string;
  productImage: string;
  price: number;
  description: string;
  merchantWallet?: string;
}

const BlinkPreview = ({ 
  productName, 
  productImage, 
  price, 
  description,
  merchantWallet 
}: BlinkPreviewProps) => {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { sendUSDCTransaction } = useUSDCTransaction();
  const { sendMultiTokenTransaction, getTokenInfo, getSupportedTokens } = useMultiTokenTransaction();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  // Function to convert various image URLs to direct loadable format
  const normalizeImageUrl = (url: string): string => {
    if (!url) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop";
    
    // If it's an Unsplash URL, convert to direct format
    if (url.includes("unsplash.com/photos/")) {
      const photoId = url.split("/photos/")[1]?.split("?")[0];
      if (photoId) {
        return `https://images.unsplash.com/photo-${photoId}?w=800&h=600&fit=crop`;
      }
    }
    
    // If it's a Google Images URL (imgres), extract the imgurl parameter
    if (url.includes("google.com/imgres")) {
      const match = url.match(/imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    
    // If it's a Google Images redirect, try to extract the image URL
    if (url.includes("google.com") && url.includes("url=")) {
      const match = url.match(/url=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    
    // If it's a Pexels URL, convert to direct format
    if (url.includes("pexels.com")) {
      const photoId = url.split("-").pop();
      if (photoId && /^\d+$/.test(photoId)) {
        return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`;
      }
    }
    
    // If it's a Pixabay URL
    if (url.includes("pixabay.com")) {
      const photoId = url.split("-").pop();
      if (photoId && /^\d+$/.test(photoId)) {
        return `https://pixabay.com/get/${photoId}/?raw=1`;
      }
    }
    
    // If it's Imgur, ensure it's the direct image format
    if (url.includes("imgur.com")) {
      if (!url.includes(".jpg") && !url.includes(".png") && !url.includes(".gif")) {
        const id = url.split("/").pop()?.split("?")[0];
        return `https://i.imgur.com/${id}.jpg`;
      }
    }
    
    // If it's a Pinterest URL, we can't easily extract the image, so try the URL as-is
    // but note that Pinterest blocks direct image access
    
    // For any other URL, try to use it directly (with CORS headers)
    return url;
  };

  // Reset image error when image URL changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [productImage]);

  const handleImageError = () => {
    console.log("Image failed to load:", productImage);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", productImage);
    setImageLoading(false);
  };

  const normalizedImage = normalizeImageUrl(productImage);
  const displayImage = imageError ? normalizeImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop") : normalizedImage;

  const handleBuyNow = async () => {
    // Check if wallet is connected
    if (!connected) {
      toast.error("Please connect your wallet first");
      setVisible(true);
      return;
    }

    // Check if merchant wallet is available
    if (!merchantWallet) {
      toast.error("Merchant wallet not available");
      return;
    }

    // Prevent buying from yourself
    if (publicKey?.toString() === merchantWallet) {
      toast.error("You cannot buy your own product");
      return;
    }

    setLoading(true);
    setTransactionStatus("processing");

    try {
      toast.loading(`Processing ${selectedToken} payment...`);

      // Send multi-token transaction
      const signature = await sendMultiTokenTransaction({
        token: selectedToken,
        amount: price,
        recipientAddress: merchantWallet,
        reference: `blink-${productName.replace(/\s+/g, "-").toLowerCase()}`,
      });

      if (signature) {
        setTxHash(signature);
        
        // Record payment with Anchor program (on-chain)
        const blinkId = `blink-${Date.now()}`;
        paymentTracker.createBlink(
          blinkId,
          new PublicKey(merchantWallet),
          productName,
          price,
          selectedToken // Track which token was used
        );

        // Process with advanced Circle APIs for settlement
        const advancedCircleResult = await processAdvancedCirclePayment({
          merchantWalletId: merchantWallet,
          buyerWallet: publicKey.toString(),
          amountUSDC: selectedToken === "USDC" ? price : price, // Would convert SOL/USDT to USDC in production
          blinkId,
          transactionHash: signature,
          supportedChains: ["solana", "base"],
        });

        if (advancedCircleResult.success) {
          setTransactionStatus("success");
          toast.success(
            `✅ Payment successful! ${price} ${selectedToken} sent via Circle Payments Network.\n` +
            `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}\n` +
            `Ready for settlement.`
          );
          console.log("Multi-Token Payment Recorded:", {
            signature,
            merchant: merchantWallet,
            amount: price,
            token: selectedToken,
            fxQuoteId: advancedCircleResult.fxQuote?.id,
            paymentId: advancedCircleResult.payment?.id,
          });
        } else {
          // Fallback to basic Circle integration if advanced fails
          const basicResult = await processCirclePayment({
            merchantWallet,
            amountUSDC: selectedToken === "USDC" ? price : price,
            blinkId,
            buyerWallet: publicKey.toString(),
            transactionHash: signature,
          });

          if (basicResult.success) {
            setTransactionStatus("success");
            toast.success(
              `✅ Payment successful! ${price} ${selectedToken} sent. Funds will be settled via Circle.`
            );
          } else {
            setTransactionStatus("error");
            toast.error(`Payment completed but settlement tracking failed: ${basicResult.error}`);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed";
      setTransactionStatus("error");
      toast.error(`USDC Payment Error: ${errorMessage}`);
      console.error("Purchase error:", error);
    } finally {
      setLoading(false);
      // Reset status after 5 seconds
      setTimeout(() => setTransactionStatus("idle"), 5000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mock Social Media Post Container */}
      <div className="glass rounded-2xl p-4 animate-slide-up">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">BlinkShop Merchant</p>
            <p className="text-muted-foreground text-xs">@merchant · 2m</p>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-foreground mb-4 text-sm">
          🚀 Check out our latest product! Buy instantly with USDC ⬇️
        </p>

        {/* Blink Card - The Interactive Widget */}
        <div className="rounded-xl overflow-hidden border border-border bg-card">
          {/* Product Image */}
          <div className="relative aspect-video overflow-hidden bg-secondary/50">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 z-10">
                <Loader className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <img 
              key={displayImage}
              src={displayImage} 
              alt={productName}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
              decoding="async"
            />
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Instant
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display font-semibold text-foreground">{productName}</h3>
              <span className="text-primary font-bold">{price} USDC</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
            
            {/* Token Selection Dropdown */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Payment Token
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent flex items-center justify-between"
                  disabled={loading || !connected}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{selectedToken}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedToken === "SOL" && "◎"}
                      {selectedToken === "USDC" && "💵"}
                      {selectedToken === "USDT" && "💵"}
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTokenDropdown ? "rotate-180" : ""}`} />
                </button>

                {showTokenDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50">
                    {["SOL", "USDC", "USDT"].map((token) => (
                      <button
                        key={token}
                        onClick={() => {
                          setSelectedToken(token as TokenType);
                          setShowTokenDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                          selectedToken === token ? "bg-primary/20 font-semibold" : ""
                        }`}
                      >
                        <span>
                          {token === "SOL" && "◎"}
                          {token === "USDC" && "💵"}
                          {token === "USDT" && "💵"}
                        </span>
                        <span>{token}</span>
                        {selectedToken === token && <span className="ml-auto text-primary">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button 
              variant="hero" 
              className="w-full" 
              size="lg"
              onClick={handleBuyNow}
              disabled={loading || !connected || transactionStatus === "success"}
            >
              {transactionStatus === "success" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Payment Successful!
                </>
              ) : transactionStatus === "error" ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Payment Failed
                </>
              ) : loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : !connected ? (
                <>
                  <Wallet className="w-4 h-4" />
                  Connect Wallet to Buy
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Buy Now ({price} {selectedToken})
                </>
              )}
            </Button>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 101 88" className="w-3 h-3 fill-current">
                  <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.310874 87.2029 0.160416 86.8659C0.00995765 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0920064 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.3179C17.5676 66.9408 18.0047 66.6402 18.4904 66.4344C18.9762 66.2286 19.5765 66.1224 20.106 66.1224H99.0644C99.4415 66.1224 99.8105 66.2298 100.126 66.4313C100.441 66.6327 100.689 66.9195 100.84 67.2565C100.99 67.5935 101.036 67.9659 100.972 68.3279C100.908 68.69 100.737 69.0133 100.48 69.2817V69.3817Z"/>
                  <path d="M83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2107 81.5055 33.1045 80.9743 33.1045H1.93563C1.55849 33.1045 1.18957 33.2119 0.874202 33.4133C0.558829 33.6148 0.310874 33.9016 0.160416 34.2386C0.00995765 34.5765 -0.0359181 34.9489 0.0280382 35.311C0.0920064 35.6731 0.263131 36.0091 0.520422 36.2777L17.2061 53.7876C17.5676 54.1647 18.0047 54.4654 18.4904 54.6711C18.9762 54.8769 19.5765 54.9832 20.106 54.9832H99.0644C99.4415 54.9832 99.8105 54.8758 100.126 54.6743C100.441 54.4729 100.689 54.1861 100.84 53.8491C100.99 53.5121 101.036 53.1397 100.972 52.7776C100.908 52.4155 100.737 52.0795 100.48 51.8109L83.8068 34.3032Z"/>
                  <path d="M0.520422 20.1821C0.263131 20.4507 0.0920064 20.7867 0.0280382 21.1488C-0.0359181 21.5109 0.00995765 21.8833 0.160416 22.2203C0.310874 22.5573 0.558829 22.8441 0.874202 23.0455C1.18957 23.247 1.55849 23.3544 1.93563 23.3544H80.9743C81.5055 23.3544 82.0312 23.2481 82.5185 23.0419C83.0058 22.8357 83.4444 22.5341 83.8068 22.1557L100.48 4.63585C100.737 4.36727 100.908 4.03125 100.972 3.66917C101.036 3.30708 100.99 2.93468 100.84 2.59767C100.689 2.26066 100.441 1.97388 100.126 1.77241C99.8105 1.57095 99.4415 1.46355 99.0644 1.46355H20.106C19.5765 1.46355 18.9762 1.56975 18.4904 1.7756C18.0047 1.98145 17.5676 2.28201 17.2061 2.65918L0.520422 20.1821Z"/>
                </svg>
                Powered by Solana
              </span>
              <span>•</span>
              <span>{selectedToken}</span>
              <span>•</span>
              <span>Circle Payments</span>
            </div>

            {/* Transaction Status */}
            {txHash && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-xs text-primary font-mono break-all">
                  ✓ {txHash.slice(0, 20)}...{txHash.slice(-20)}
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  View on Solana Explorer →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-6 mt-4 text-muted-foreground">
          <button className="flex items-center gap-2 hover:text-foreground transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            24
          </button>
          <button className="flex items-center gap-2 hover:text-foreground transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            156
          </button>
          <button className="flex items-center gap-2 hover:text-primary transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            892
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlinkPreview;
