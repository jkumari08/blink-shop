import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BlinkPreview from "./BlinkPreview";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div className="animate-slide-up">
            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Sell Anywhere with{" "}
              <span className="gradient-text">Solana Blinks</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Turn any social post into a storefront. Create interactive buy buttons 
              that work on X, Discord, and Reddit. Accept USDC instantly.
            </p>

            {/* CTA */}
            <div className="mb-12">
              <Link to="/create">
                <Button variant="hero" size="xl">
                  Create Your First Blink
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="font-display text-2xl md:text-3xl font-bold gradient-text">400ms</p>
                <p className="text-muted-foreground text-sm">Transaction Speed</p>
              </div>
              <div>
                <p className="font-display text-2xl md:text-3xl font-bold gradient-text">$0.001</p>
                <p className="text-muted-foreground text-sm">Per Transaction</p>
              </div>
              <div>
                <p className="font-display text-2xl md:text-3xl font-bold gradient-text">USDC</p>
                <p className="text-muted-foreground text-sm">Stable Payments</p>
              </div>
            </div>
          </div>

          {/* Right Content - Blink Preview */}
          <div className="lg:pl-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl scale-110" />
              
              <BlinkPreview
                productName="Limited Edition Hackathon Hoodie"
                productImage="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop"
                price={25}
                description="Exclusive merch for Solana builders. Soft cotton blend, minimalist design."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
