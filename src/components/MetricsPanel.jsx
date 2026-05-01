import React from "react";
import { motion } from "motion/react";

const MetricsPanel = ({ properties, metadata }) => {
  if (!properties) return null;

  return (
    <div className="space-y-4">
      {/* Primary Properties */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div 
          className="bg-black/30 rounded-xl p-4 border border-white/5 shadow-lg group hover:border-[var(--neon-blue)]/30 transition-all"
          whileHover={{ y: -2 }}
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">QED</p>
          <p className="text-xl font-mono font-bold text-[var(--neon-blue)] drop-shadow-[0_0_8px_var(--neon-blue)]/30">
            {properties.qed.toFixed(2)}
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-black/30 rounded-xl p-4 border border-white/5 shadow-lg group hover:border-[var(--neon-purple)]/30 transition-all"
          whileHover={{ y: -2 }}
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">logP</p>
          <p className="text-xl font-mono font-bold text-[var(--neon-purple)] drop-shadow-[0_0_8px_var(--neon-purple)]/30">
            {properties.logP.toFixed(2)}
          </p>
        </motion.div>

        <motion.div 
          className="bg-black/30 rounded-xl p-4 border border-white/5 shadow-lg group hover:border-[var(--neon-green)]/30 transition-all"
          whileHover={{ y: -2 }}
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Synth</p>
          <p className="text-xl font-mono font-bold text-[var(--neon-green)] drop-shadow-[0_0_8px_var(--neon-green)]/30">
            {properties.synthesizability.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Secondary Metadata */}
      {metadata && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/2 rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">System Validity</span>
            <span className="text-xs font-mono font-bold text-[var(--neon-green)]">
              {metadata.validity.toFixed(1)}%
            </span>
          </div>
          <div className="bg-white/2 rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Structural Novelty</span>
            <span className="text-xs font-mono font-bold text-[var(--neon-blue)]">
              {metadata.novelty.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Validity Status Badge */}
      <div className="flex items-center gap-2">
        <div className={`h-1.5 w-1.5 rounded-full ${properties.isValid ? 'bg-[var(--neon-green)] shadow-[0_0_8px_var(--neon-green)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest ${properties.isValid ? 'text-[var(--neon-green)]' : 'text-red-400'}`}>
          {properties.isValid ? 'Structure Validated' : 'Validation Failed'}
        </span>
      </div>
    </div>
  );
};

export default MetricsPanel;
