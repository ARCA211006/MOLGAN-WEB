import React from "react";
import { Atom } from "lucide-react";

const Header = () => {
  return (
    <header className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-b border-[var(--glass-border)] z-10">
      <div className="px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--neon-purple)]/20">
          <Atom className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-medium tracking-tight">MolGAN AI</h1>
          <p className="text-xs text-muted-foreground font-light tracking-wide uppercase">Molecular Generation Assistant</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
