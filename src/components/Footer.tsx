import { Zap, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">BlinkShop</span>
          </Link>

          {/* Tech Stack */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Built with</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 101 88" className="w-4 h-4 fill-current">
                  <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.310874 87.2029 0.160416 86.8659C0.00995765 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0920064 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.3179C17.5676 66.9408 18.0047 66.6402 18.4904 66.4344C18.9762 66.2286 19.5765 66.1224 20.106 66.1224H99.0644C99.4415 66.1224 99.8105 66.2298 100.126 66.4313C100.441 66.6327 100.689 66.9195 100.84 67.2565C100.99 67.5935 101.036 67.9659 100.972 68.3279C100.908 68.69 100.737 69.0133 100.48 69.2817V69.3817Z"/>
                  <path d="M83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2107 81.5055 33.1045 80.9743 33.1045H1.93563C1.55849 33.1045 1.18957 33.2119 0.874202 33.4133C0.558829 33.6148 0.310874 33.9016 0.160416 34.2386C0.00995765 34.5765 -0.0359181 34.9489 0.0280382 35.311C0.0920064 35.6731 0.263131 36.0091 0.520422 36.2777L17.2061 53.7876C17.5676 54.1647 18.0047 54.4654 18.4904 54.6711C18.9762 54.8769 19.5765 54.9832 20.106 54.9832H99.0644C99.4415 54.9832 99.8105 54.8758 100.126 54.6743C100.441 54.4729 100.689 54.1861 100.84 53.8491C100.99 53.5121 101.036 53.1397 100.972 52.7776C100.908 52.4155 100.737 52.0795 100.48 51.8109L83.8068 34.3032Z"/>
                  <path d="M0.520422 20.1821C0.263131 20.4507 0.0920064 20.7867 0.0280382 21.1488C-0.0359181 21.5109 0.00995765 21.8833 0.160416 22.2203C0.310874 22.5573 0.558829 22.8441 0.874202 23.0455C1.18957 23.247 1.55849 23.3544 1.93563 23.3544H80.9743C81.5055 23.3544 82.0312 23.2481 82.5185 23.0419C83.0058 22.8357 83.4444 22.5341 83.8068 22.1557L100.48 4.63585C100.737 4.36727 100.908 4.03125 100.972 3.66917C101.036 3.30708 100.99 2.93468 100.84 2.59767C100.689 2.26066 100.441 1.97388 100.126 1.77241C99.8105 1.57095 99.4415 1.46355 99.0644 1.46355H20.106C19.5765 1.46355 18.9762 1.56975 18.4904 1.7756C18.0047 1.98145 17.5676 2.28201 17.2061 2.65918L0.520422 20.1821Z"/>
                </svg>
                Solana
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-[#2775CA] flex items-center justify-center">
                  <span className="text-[8px] font-bold text-foreground">$</span>
                </div>
                USDC
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/jkumari08/blink-checkout" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://x.com/blinkshop2025" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 BlinkShop. Built for Midwest Blockchain Conference 2025.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
