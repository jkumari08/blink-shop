import { ArrowRight, Package, Link, Share, DollarSign } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Package className="w-6 h-6" />,
      step: "01",
      title: "Add Your Product",
      description: "Upload image, set price in USDC, add description.",
    },
    {
      icon: <Link className="w-6 h-6" />,
      step: "02",
      title: "Generate Blink",
      description: "We create a Solana Action URL for your product.",
    },
    {
      icon: <Share className="w-6 h-6" />,
      step: "03",
      title: "Share Anywhere",
      description: "Post on X, Discord, or any social platform.",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      step: "04",
      title: "Get Paid",
      description: "Receive USDC directly to your wallet instantly.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From product to payment in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <div key={item.step} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="glass rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-300">
                {/* Step Number & Icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground">
                    {item.icon}
                  </div>
                  <span className="font-display text-4xl font-bold text-muted-foreground/30 group-hover:text-primary/30 transition-colors">
                    {item.step}
                  </span>
                </div>
                
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="/create" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all">
            <span className="font-medium">Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
