import { ArrowRight } from "lucide-react";

export function PipelineVisual() {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-black/20 rounded-lg border border-white/5">
      <div className="flex items-center gap-2 text-xs">
        <div className="px-3 py-1.5 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)]/30 rounded text-[var(--neon-purple)]">
          z latent
        </div>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <div className="px-3 py-1.5 bg-[var(--neon-blue)]/20 border border-[var(--neon-blue)]/30 rounded text-[var(--neon-blue)]">
          Generator
        </div>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <div className="px-3 py-1.5 bg-[var(--neon-green)]/20 border border-[var(--neon-green)]/30 rounded text-[var(--neon-green)]">
          Molecular Graph
        </div>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded text-amber-400">
          Reward Score
        </div>
      </div>
    </div>
  );
}
