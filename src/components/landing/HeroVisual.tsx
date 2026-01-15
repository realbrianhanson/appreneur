import { Code, Smartphone, Layers, Zap } from "lucide-react";

const HeroVisual = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main mockup container */}
      <div className="relative">
        {/* Glow effect behind */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-accent/10 to-transparent blur-3xl scale-150" />
        
        {/* Phone mockup */}
        <div className="relative z-10 rounded-[2.5rem] bg-gradient-to-b from-card to-card/80 border-2 border-border/50 p-2 shadow-2xl mx-auto w-64 md:w-72">
          {/* Phone notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-background rounded-full" />
          
          {/* Screen content */}
          <div className="rounded-[2rem] bg-background-secondary overflow-hidden">
            {/* Status bar */}
            <div className="h-8 bg-card/50 flex items-center justify-center">
              <div className="w-12 h-1 bg-muted rounded-full" />
            </div>
            
            {/* App UI mockup */}
            <div className="p-4 space-y-4 min-h-[400px]">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="w-24 h-3 bg-foreground/20 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-primary/20" />
              </div>
              
              {/* Cards */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-card border border-border animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="w-20 h-2 bg-foreground/20 rounded-full" />
                      <div className="w-32 h-2 bg-foreground/10 rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="w-16 h-2 bg-foreground/20 rounded-full" />
                      <div className="w-24 h-2 bg-foreground/10 rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Code className="w-5 h-5 text-accent" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="w-24 h-2 bg-foreground/20 rounded-full" />
                      <div className="w-28 h-2 bg-foreground/10 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Button */}
              <div className="pt-4">
                <div className="h-12 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <div className="w-20 h-2 bg-primary-foreground/50 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements around phone */}
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center animate-float">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        
        <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
          <Code className="w-6 h-6 text-accent" />
        </div>
        
        <div className="absolute top-1/2 -right-8 w-10 h-10 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
          <Zap className="w-5 h-5 text-secondary" />
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;
