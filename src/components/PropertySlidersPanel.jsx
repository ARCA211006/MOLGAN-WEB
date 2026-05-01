import React from "react";
import * as Slider from "@radix-ui/react-slider";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Sliders, CheckCircle2, Info } from "lucide-react";

const PropertySlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground/90">{label}</span>
          <Tooltip.Provider delayDuration={300}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-popover text-popover-foreground px-4 py-2.5 rounded-xl text-xs max-w-xs border border-border shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95"
                  sideOffset={8}
                >
                  <p className="leading-relaxed">{tooltip}</p>
                  <Tooltip.Arrow className="fill-popover" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--neon-blue)] bg-[var(--neon-blue)]/10 px-2 py-0.5 rounded">
          {value.toFixed(2)}
        </span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="bg-white/5 relative grow rounded-full h-1.5 overflow-hidden">
          <Slider.Range className="absolute bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-full h-full shadow-[0_0_8px_var(--neon-blue)]" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:bg-[var(--neon-blue)] hover:scale-110 active:scale-95 transition-all focus:outline-none ring-2 ring-transparent focus:ring-[var(--neon-blue)] focus:ring-offset-2 focus:ring-offset-background"
          aria-label={label}
        />
      </Slider.Root>
    </div>
  );
};

const PropertySlidersPanel = ({ properties, onPropertyChange }) => {
  return (
    <div className="h-full bg-[var(--glass-bg)] backdrop-blur-3xl border-l border-[var(--glass-border)] flex flex-col shadow-2xl relative z-10">
      <div className="p-8 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-2xl flex items-center justify-center shadow-xl shadow-[var(--neon-purple)]/10">
            <Sliders className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Molecular Targets</h2>
            <p className="text-xs text-muted-foreground font-light">Guide the generative process</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/20 rounded-xl">
          <div className="relative">
             <CheckCircle2 className="w-4 h-4 text-[var(--neon-green)] flex-shrink-0" />
             <div className="absolute inset-0 bg-[var(--neon-green)] blur-[4px] opacity-50" />
          </div>
          <span className="text-xs font-medium text-[var(--neon-green)]">Active constraints applied</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <PropertySlider
          label="QED (Drug-likeness)"
          value={properties.qed}
          onChange={(value) => onPropertyChange("qed", value)}
          min={0}
          max={1}
          step={0.01}
          tooltip="Quantitative Estimate of Drug-likeness. Higher values indicate better drug-like properties (0-1 scale)."
        />

        <PropertySlider
          label="logP (Lipophilicity)"
          value={properties.logP}
          onChange={(value) => onPropertyChange("logP", value)}
          min={-2}
          max={6}
          step={0.1}
          tooltip="Partition coefficient measuring solubility. Optimal range: 0-3 for drug-like molecules."
        />

        <PropertySlider
          label="Synthesizability"
          value={properties.synthesizability}
          onChange={(value) => onPropertyChange("synthesizability", value)}
          min={0}
          max={1}
          step={0.01}
          tooltip="Synthetic Accessibility score. Higher values indicate easier synthesis (0-1 scale)."
        />

        <PropertySlider
          label="Diversity"
          value={properties.diversity}
          onChange={(value) => onPropertyChange("diversity", value)}
          min={0}
          max={1}
          step={0.01}
          tooltip="Molecular diversity target. Higher values encourage more structurally diverse molecules."
        />

        <div className="pt-8 mt-4 border-t border-white/5">
          <div className="bg-black/40 rounded-2xl p-5 border border-white/5 shadow-inner">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Real-time Performance</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">Validity Rate</span>
                <span className="text-xs font-bold text-[var(--neon-green)] shadow-[0_0_8px_var(--neon-green)]/20">98.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">Structural Novelty</span>
                <span className="text-xs font-bold text-[var(--neon-blue)] shadow-[0_0_8px_var(--neon-blue)]/20">87.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/80">Sample Uniqueness</span>
                <span className="text-xs font-bold text-[var(--neon-purple)] shadow-[0_0_8px_var(--neon-purple)]/20">92.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySlidersPanel;
