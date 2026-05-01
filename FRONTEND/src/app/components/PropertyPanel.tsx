import { PropertySlider } from "./PropertySlider";
import { Sliders, CheckCircle2 } from "lucide-react";

interface PropertyPanelProps {
  properties: {
    qed: number;
    logP: number;
    synthesizability: number;
    diversity: number;
  };
  onPropertyChange: (key: string, value: number) => void;
}

export function PropertyPanel({ properties, onPropertyChange }: PropertyPanelProps) {
  return (
    <div className="h-full bg-[var(--glass-bg)] backdrop-blur-xl border-l border-[var(--glass-border)] flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-xl flex items-center justify-center">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-foreground">Molecular Targets</h2>
            <p className="text-xs text-muted-foreground">Control generation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-[var(--neon-green)] flex-shrink-0" />
          <span className="text-xs text-[var(--neon-green)]">Active constraints applied</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-muted-foreground mb-3">
            These parameters guide the model's reward optimization
          </p>
          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
            <div className="text-xs text-muted-foreground mb-2">Training Stats</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Validity</span>
                <span className="text-xs text-[var(--neon-green)]">98.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Novelty</span>
                <span className="text-xs text-[var(--neon-blue)]">87.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uniqueness</span>
                <span className="text-xs text-[var(--neon-purple)]">92.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
