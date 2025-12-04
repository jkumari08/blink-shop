import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import BlinkPreview from "@/components/BlinkPreview";
import { Copy, Check, ImagePlus, Zap, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { toast } from "sonner";
import { useBlinkManagement } from "@/hooks/useBlinkManagement";

const CreateBlink = () => {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { createNewBlink, loading, error } = useBlinkManagement();
  
  const [productName, setProductName] = useState("My Awesome Product");
  const [description, setDescription] = useState("A great product that everyone needs!");
  const [price, setPrice] = useState("5");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop");
  const [copied, setCopied] = useState(false);
  const [generatedBlink, setGeneratedBlink] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCopyLink = () => {
    if (generatedBlink) {
      navigator.clipboard.writeText(generatedBlink);
      setCopied(true);
      toast.success("Blink link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateBlink = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      setVisible(true);
      return;
    }

    if (!productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    const blink = await createNewBlink(productName, description, price, imageUrl);
    
    if (blink) {
      setGeneratedBlink(blink.blinkUrl);
      setSuccess(true);
      toast.success("Blink created successfully!");
      setTimeout(() => setSuccess(false), 3000);
    } else {
      toast.error(error || "Failed to create blink");
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
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Create in seconds</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Create Your <span className="gradient-text">Blink</span>
            </h1>
            <p className="text-muted-foreground">
              Fill in your product details and generate a shareable Blink instantly.
            </p>
          </div>

          {/* Wallet Connection Alert */}
          {!connected && (
            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex gap-3 animate-slide-up">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Wallet Not Connected</p>
                <p className="text-sm text-muted-foreground">
                  You need to connect your Solana wallet to create blinks and receive USDC payments.
                </p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setVisible(true)}
                >
                  Connect Wallet
                </Button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="glass rounded-2xl p-6 md:p-8 animate-slide-up">
              <h2 className="font-display text-xl font-semibold mb-6">Product Details</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    disabled={loading}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    className="bg-secondary/50 border-border min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USDC) *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={loading}
                      className="bg-secondary/50 border-border pl-12"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Product Image URL *</Label>
                  <div className="relative">
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      disabled={loading}
                      className="bg-secondary/50 border-border pl-12"
                    />
                    <ImagePlus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 flex gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary">Blink created successfully!</p>
                  </div>
                )}

                {/* Generated Link */}
                {generatedBlink && (
                  <div className="pt-6 border-t border-border">
                    <Label className="mb-3 block">Your Blink Link</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={generatedBlink}
                        className="bg-card border-border font-mono text-sm"
                      />
                      <Button 
                        variant="hero" 
                        size="icon"
                        onClick={handleCopyLink}
                        disabled={loading}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  variant="gradient" 
                  size="lg" 
                  className="w-full"
                  onClick={handleGenerateBlink}
                  disabled={loading || !connected}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Blink
                    </>
                  )}
                </Button>

                {!connected && (
                  <p className="text-xs text-muted-foreground text-center">
                    Connect your wallet above to create a blink
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-semibold mb-6 text-center lg:text-left">
                Live Preview
              </h2>
              <BlinkPreview
                productName={productName || "Product Name"}
                productImage={imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop"}
                price={parseFloat(price) || 0}
                description={description || "Product description"}
                merchantWallet={publicKey?.toString()}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBlink;
