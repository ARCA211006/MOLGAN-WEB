import { motion } from "motion/react";
import { useState } from "react";
import { User, Sparkles, RotateCw, Save } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { MoleculeGraph } from "./MoleculeGraph";
import { MatrixView } from "./MatrixView";
import { PipelineVisual } from "./PipelineVisual";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  molecule?: {
    atoms: Array<{ element: string; x: number; y: number }>;
    bonds: Array<{ from: number; to: number; type: number }>;
    smiles?: string;
    properties: {
      qed: number;
      logP: number;
      synthesizability: number;
      isValid: boolean;
    };
    metadata?: {
      validity: number;
      novelty: number;
    };
  };
  onRegenerate?: () => void;
}

export function ChatMessage({ role, content, molecule, onRegenerate }: ChatMessageProps) {
  const isUser = role === "user";
  const [activeTab, setActiveTab] = useState("graph");

  const handleSave = () => {
    console.log("Saving molecule...");
    // Mock save functionality
  };

  return (
    <motion.div
      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] flex items-center justify-center flex-shrink-0 shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      )}

      <div className={`max-w-full flex-1 ${isUser ? "items-end" : "items-start"} flex flex-col gap-3`}>
        <div
          className={`px-5 py-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] text-white ml-auto"
              : "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          }`}
        >
          <p className="leading-relaxed">{content}</p>
        </div>

        {molecule && (
          <motion.div
            className="w-full bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-foreground mb-1">Generated Molecule</h3>
                  {molecule.smiles && (
                    <p className="text-xs font-mono text-muted-foreground">
                      {molecule.smiles}
                    </p>
                  )}
                </div>
                {molecule.isValid ? (
                  <span className="text-xs px-3 py-1 bg-[var(--neon-green)]/20 text-[var(--neon-green)] rounded-full border border-[var(--neon-green)]/30">
                    Valid
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                    Invalid
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex border-b border-white/10 px-5">
                <Tabs.Trigger
                  value="graph"
                  className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent data-[state=active]:border-[var(--neon-blue)] data-[state=active]:text-[var(--neon-blue)]"
                >
                  Graph View
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="matrix"
                  className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent data-[state=active]:border-[var(--neon-purple)] data-[state=active]:text-[var(--neon-purple)]"
                >
                  Matrix View
                </Tabs.Trigger>
              </Tabs.List>

              <div className="p-5">
                <Tabs.Content value="graph" className="space-y-4">
                  <div className="h-64 bg-black/20 rounded-xl border border-white/5">
                    <MoleculeGraph atoms={molecule.atoms} bonds={molecule.bonds} />
                  </div>

                  <PipelineVisual />

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                      <p className="text-xs text-muted-foreground mb-1">QED</p>
                      <p className="text-lg font-mono text-[var(--neon-blue)]">
                        {molecule.properties.qed.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                      <p className="text-xs text-muted-foreground mb-1">logP</p>
                      <p className="text-lg font-mono text-[var(--neon-purple)]">
                        {molecule.properties.logP.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                      <p className="text-xs text-muted-foreground mb-1">Synth</p>
                      <p className="text-lg font-mono text-[var(--neon-green)]">
                        {molecule.properties.synthesizability.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {molecule.metadata && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Validity</p>
                        <p className="text-sm font-mono text-[var(--neon-green)]">
                          {molecule.metadata.validity.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Novelty</p>
                        <p className="text-sm font-mono text-[var(--neon-blue)]">
                          {molecule.metadata.novelty.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </Tabs.Content>

                <Tabs.Content value="matrix">
                  <MatrixView atoms={molecule.atoms} bonds={molecule.bonds} />
                </Tabs.Content>
              </div>
            </Tabs.Root>

            {/* Actions */}
            <div className="p-5 border-t border-white/10 flex gap-3">
              <button
                onClick={onRegenerate}
                className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--neon-blue)]/50 rounded-lg transition-all flex items-center justify-center gap-2 group"
              >
                <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-sm">Regenerate</span>
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] hover:opacity-90 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Save Molecule</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}
