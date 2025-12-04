import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <div 
      className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:glow-sm group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      <h3 className="font-display font-semibold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
