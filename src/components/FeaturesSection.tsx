import { Zap, Globe, Shield, Wallet, Share2, BarChart3 } from "lucide-react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Sell on Any Platform",
      description: "Your Blinks unfurl on X, Discord, Reddit, and anywhere that renders Open Graph previews.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Checkout",
      description: "One-click purchases powered by Solana's 400ms finality. No cart abandonment.",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "USDC Payments",
      description: "Accept stable, dollar-backed payments. No crypto volatility for your business.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Non-Custodial",
      description: "Funds go directly to your wallet. No intermediaries, no delays.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Sell to anyone, anywhere. No borders, no banking restrictions.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track views, clicks, and conversions. Optimize your social selling.",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why <span className="gradient-text">BlinkShop</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            The fastest way to monetize your social presence with Web3 commerce.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
