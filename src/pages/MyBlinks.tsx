import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Copy, Trash2, ExternalLink, Zap, Loader } from "lucide-react";
import { toast } from "sonner";
import { useBlinkManagement } from "@/hooks/useBlinkManagement";
import { Link } from "react-router-dom";
import { useState } from "react";

const MyBlinks = () => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { blinks, getMyBlinks, deleteBlink } = useBlinkManagement();
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  const myBlinks = getMyBlinks();

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

  const handleImageError = (blinkId: string) => {
    setImageErrors(prev => ({ ...prev, [blinkId]: true }));
    setImageLoading(prev => ({ ...prev, [blinkId]: false }));
  };

  const handleImageLoad = (blinkId: string) => {
    setImageLoading(prev => ({ ...prev, [blinkId]: false }));
  };

  const getDisplayImage = (blinkId: string, imageUrl: string) => {
    const normalized = normalizeImageUrl(imageUrl);
    return imageErrors[blinkId] ? normalizeImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop") : normalized;
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleDeleteBlink = (blinkId: string) => {
    if (window.confirm("Are you sure you want to delete this blink?")) {
      deleteBlink(blinkId);
      toast.success("Blink deleted successfully");
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
              <span className="text-sm text-muted-foreground">Your Store</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              My <span className="gradient-text">Blinks</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your Blinks and track your earnings.
            </p>
          </div>

          {!connected ? (
            <div className="max-w-2xl mx-auto glass rounded-2xl p-8 text-center animate-slide-up">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                You need to connect your Solana wallet to view and manage your blinks.
              </p>
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => setVisible(true)}
              >
                Connect Wallet
              </Button>
            </div>
          ) : myBlinks.length === 0 ? (
            <div className="max-w-2xl mx-auto glass rounded-2xl p-8 text-center animate-slide-up">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">No Blinks Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first blink to start selling on social media!
              </p>
              <Link to="/create">
                <Button variant="gradient" size="lg">
                  Create Your First Blink
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {myBlinks.map((blink) => (
                <div key={blink.id} className="glass rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
                  {/* Product Image */}
                  <div className="aspect-video overflow-hidden bg-secondary/50 relative">
                    {(imageLoading[blink.id] && !imageErrors[blink.id]) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 z-10">
                        <Loader className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                    <img
                      key={getDisplayImage(blink.id, blink.product.imageUrl)}
                      src={getDisplayImage(blink.id, blink.product.imageUrl)}
                      alt={blink.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={() => handleImageError(blink.id)}
                      onLoad={() => handleImageLoad(blink.id)}
                      crossOrigin="anonymous"
                      decoding="async"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-2">
                      {blink.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {blink.product.description}
                    </p>

                    {/* Price */}
                    <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      <p className="font-display text-lg font-bold text-primary">
                        ${blink.product.price.toFixed(2)} USDC
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCopyLink(blink.blinkUrl)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <a
                          href={blink.blinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteBlink(blink.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Blink ID */}
                    <p className="text-xs text-muted-foreground mt-3 truncate">
                      ID: {blink.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Button - Floating */}
          {connected && myBlinks.length > 0 && (
            <div className="flex justify-center mt-12">
              <Link to="/create">
                <Button variant="gradient" size="lg">
                  <Zap className="w-4 h-4" />
                  Create Another Blink
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBlinks;
