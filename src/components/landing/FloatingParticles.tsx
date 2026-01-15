const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-primary/30 animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-accent/30 animate-float" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-secondary/30 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/20 animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-1/4 right-10 w-2.5 h-2.5 rounded-full bg-accent/20 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-20 w-1.5 h-1.5 rounded-full bg-secondary/20 animate-float" style={{ animationDelay: "2.5s" }} />
      
      {/* Gradient lines */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
    </div>
  );
};

export default FloatingParticles;
