import React, { useState } from "react";
import Header from "./components/Header";
import ObjectiveInputCard from "./components/ObjectiveInputCard";
import PropertySlidersPanel from "./components/PropertySlidersPanel";
import MoleculeDisplayPanel from "./components/MoleculeDisplayPanel";
import MetricsPanel from "./components/MetricsPanel";
import { Atom, Sparkles, RotateCw, Save, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as Tabs from "@radix-ui/react-tabs";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [properties, setProperties] = useState({
    qed: 0.7,
    logP: 2.5,
    synthesizability: 0.8,
    diversity: 0.5,
  });

  const generateMolecule = (prompt) => {
    // Simulated molecule generation logic
    const numAtoms = Math.floor(Math.random() * 8) + 8;
    const atoms = [];
    const elements = ["C", "C", "C", "O", "N", "F", "S"];

    const centerX = 200;
    const centerY = 150;
    const radius = 90;

    for (let i = 0; i < numAtoms; i++) {
      const angle = (i / numAtoms) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 30;
      atoms.push({
        element: elements[Math.floor(Math.random() * elements.length)],
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
      });
    }

    const bonds = [];
    for (let i = 0; i < numAtoms; i++) {
      const next = (i + 1) % numAtoms;
      bonds.push({
        from: i,
        to: next,
        type: Math.random() > 0.7 ? 2 : 1,
      });
    }

    // Add random cross-links
    for (let i = 0; i < 3; i++) {
        const from = Math.floor(Math.random() * numAtoms);
        const to = Math.floor(Math.random() * numAtoms);
        if (from !== to && !bonds.some(b => (b.from === from && b.to === to) || (b.from === to && b.to === from))) {
            bonds.push({ from, to, type: 1 });
        }
    }

    const smilesAtoms = atoms.map(a => a.element).join("");
    const smiles = `${smilesAtoms.substring(0, 4)}(${smilesAtoms.substring(4, 7)})${smilesAtoms.substring(7)}`;

    const qed = Math.min(1, Math.max(0, properties.qed + (Math.random() - 0.5) * 0.2));
    const logP = properties.logP + (Math.random() - 0.5) * 1.0;
    const synthesizability = Math.min(1, Math.max(0, properties.synthesizability + (Math.random() - 0.5) * 0.15));
    const isValid = Math.random() > 0.05;

    return {
      atoms,
      bonds,
      smiles,
      properties: {
        qed,
        logP,
        synthesizability,
        isValid,
      },
      metadata: {
        validity: 96.0 + Math.random() * 4,
        novelty: 82.0 + Math.random() * 12,
      },
    };
  };

  const handleSubmit = async (message) => {
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/generate/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message }),
      });

      if (!response.ok) {
        throw new Error("Backend generation failed");
      }

      const data = await response.json();
      
      // The backend returns a list of molecules. We'll display them in the chat.
      // For the sake of the chat flow, we'll treat the first one as the primary "result"
      // but the frontend could be expanded to show all.
      if (data.molecules && data.molecules.length > 0) {
        const assistantMessages = data.molecules.map((mol, index) => ({
          id: (Date.now() + index + 1).toString(),
          role: "assistant",
          content: index === 0 
            ? "I've generated candidates based on your requirements. Here is the primary structure optimized for your constraints."
            : "Alternative candidate structure:",
          molecule: {
            smiles: mol.smiles,
            // Reconstructing atoms/bonds for the visualizer is complex without raw data,
            // but for now we'll assume the visualizer can handle basic SMILES or 
            // we'll update the backend to send coordinates.
            // Since the backend 'image' is base64, we can display that directly.
            image: mol.image,
            properties: {
              qed: mol.qed,
              logP: mol.logp,
              synthesizability: mol.sa,
              isValid: true,
            }
          },
        }));

        setMessages((prev) => [...prev, ...assistantMessages]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while connecting to the generation engine. Please ensure the backend is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePropertyChange = (key, value) => {
    setProperties((prev) => ({ ...prev, [key]: value }));
  };

  const suggestedPrompts = [
    "High solubility drug-like candidate",
    "Maximized QED with low synthetic cost",
    "Novel scaffold with specific logP range",
  ];

  return (
    <div className="dark min-h-screen bg-[#050505] text-foreground flex flex-col font-sans selection:bg-[var(--neon-blue)]/30 selection:text-white overflow-hidden">
      {/* Background aesthetics */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-purple)] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)] opacity-[0.03] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <Header />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Chat & Generation Area */}
        <div className="flex-1 flex flex-col relative" style={{ width: '68%' }}>
          <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                  <div className="relative mb-10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                      <Atom className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                    Design the Future of Medicine
                  </h2>
                  <p className="text-muted-foreground max-w-lg mb-12 text-lg font-light leading-relaxed">
                    Input your molecular objectives or select a starting template. MolGAN AI will synthesize candidates in real-time.
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(prompt)}
                        className="px-6 py-3 bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:border-[var(--neon-blue)]/50 hover:bg-white/[0.05] rounded-2xl transition-all text-sm font-medium text-white/70 hover:text-white shadow-lg"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-12 max-w-5xl mx-auto pb-20">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-xl ${
                        msg.role === "user" 
                          ? "bg-zinc-800 border border-white/5" 
                          : "bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)]"
                      }`}>
                        {msg.role === "user" ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-white" />}
                      </div>

                      <div className={`flex flex-col gap-4 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-xl ${
                          msg.role === "user" 
                            ? "bg-gradient-to-br from-[var(--neon-purple)]/80 to-[var(--neon-blue)]/80 border border-white/10" 
                            : "bg-white/[0.03] backdrop-blur-xl border border-white/5"
                        }`}>
                          {msg.content}
                        </div>

                        {msg.molecule && (
                          <div className="w-full bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between px-2">
                               <div>
                                 <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Generated Structure</h4>
                                 <p className="text-sm font-mono text-[var(--neon-blue)]">{msg.molecule.smiles}</p>
                               </div>
                               <div className="bg-[var(--neon-green)]/10 text-[var(--neon-green)] px-3 py-1 rounded-full text-[10px] font-bold border border-[var(--neon-green)]/20 shadow-[0_0_10px_var(--neon-green)]/10">
                                 PASSED_VALIDITY
                               </div>
                            </div>

                            <div className="h-80 w-full flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden border border-white/5 shadow-inner group">
                               {msg.molecule.image ? (
                                 <img 
                                   src={`data:image/png;base64,${msg.molecule.image}`} 
                                   alt="Generated Molecule" 
                                   className="max-w-full max-h-full object-contain p-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500"
                                 />
                               ) : (
                                 <MoleculeDisplayPanel atoms={msg.molecule.atoms} bonds={msg.molecule.bonds} />
                               )}
                            </div>

                            <MetricsPanel properties={msg.molecule.properties} metadata={msg.molecule.metadata} />

                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <button className="flex-1 py-3 px-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-2xl transition-all flex items-center justify-center gap-2 group text-sm font-medium">
                                    <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                    Regenerate
                                </button>
                                <button className="flex-1 py-3 px-6 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] rounded-2xl transition-all flex items-center justify-center gap-2 text-sm font-bold text-white">
                                    <Save className="w-4 h-4" />
                                    Export SMILES
                                </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <ObjectiveInputCard onSubmit={handleSubmit} isGenerating={isGenerating} />
        </div>

        {/* Right: Property Control Panel */}
        <div className="flex-shrink-0 relative shadow-2xl" style={{ width: '32%' }}>
          <PropertySlidersPanel properties={properties} onPropertyChange={handlePropertyChange} />
        </div>
      </div>
    </div>
  );
}
