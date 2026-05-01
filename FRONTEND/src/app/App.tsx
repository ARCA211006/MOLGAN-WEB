import { useState } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { InputBar } from "./components/InputBar";
import { PropertyPanel } from "./components/PropertyPanel";
import { Atom } from "lucide-react";

interface Message {
  id: string;
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
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [properties, setProperties] = useState({
    qed: 0.7,
    logP: 2.5,
    synthesizability: 0.8,
    diversity: 0.5,
  });

  const generateMolecule = (prompt?: string) => {
    // Generate random molecule structure
    const numAtoms = Math.floor(Math.random() * 8) + 5;
    const atoms = [];
    const elements = ["C", "C", "C", "O", "N", "F", "S"];

    // Create atoms in a roughly circular pattern
    const centerX = 200;
    const centerY = 130;
    const radius = 80;

    for (let i = 0; i < numAtoms; i++) {
      const angle = (i / numAtoms) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 20;
      atoms.push({
        element: elements[Math.floor(Math.random() * elements.length)],
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
      });
    }

    // Generate bonds
    const bonds = [];
    for (let i = 0; i < numAtoms; i++) {
      const next = (i + 1) % numAtoms;
      bonds.push({
        from: i,
        to: next,
        type: Math.random() > 0.7 ? 2 : 1,
      });
    }

    // Add some cross bonds
    if (numAtoms > 5) {
      const crossBonds = Math.floor(Math.random() * 3);
      for (let i = 0; i < crossBonds; i++) {
        const from = Math.floor(Math.random() * numAtoms);
        let to = Math.floor(Math.random() * numAtoms);
        while (to === from || Math.abs(to - from) === 1) {
          to = Math.floor(Math.random() * numAtoms);
        }
        bonds.push({ from, to, type: 1 });
      }
    }

    // Generate SMILES-like string
    const smilesAtoms = atoms.map(a => a.element).join("");
    const smiles = `${smilesAtoms.substring(0, 4)}(${smilesAtoms.substring(4)})`;

    // Calculate properties with some randomness influenced by target properties
    const qed = Math.min(1, Math.max(0, properties.qed + (Math.random() - 0.5) * 0.3));
    const logP = properties.logP + (Math.random() - 0.5) * 1.5;
    const synthesizability = Math.min(1, Math.max(0, properties.synthesizability + (Math.random() - 0.5) * 0.2));
    const isValid = Math.random() > 0.1; // 90% validity

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
        validity: 95.0 + Math.random() * 5,
        novelty: 80.0 + Math.random() * 15,
      },
    };
  };

  const handleSubmit = (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    setTimeout(() => {
      const molecule = generateMolecule(message);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've generated a molecule based on your requirements. The structure optimizes for the properties you specified using the current constraint parameters.",
        molecule,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const molecule = generateMolecule();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I've regenerated a new molecule with similar target properties.",
        molecule,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  const handlePropertyChange = (key: string, value: number) => {
    setProperties((prev) => ({ ...prev, [key]: value }));
  };

  const suggestedPrompts = [
    "Generate a drug-like molecule with high solubility and moderate logP",
    "Create a highly synthesizable molecule with QED > 0.8",
    "Design a molecule with balanced properties for drug discovery",
  ];

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--neon-purple)]/5 via-transparent to-[var(--neon-blue)]/5 pointer-events-none" />
      <div className="fixed top-1/4 -left-1/4 w-1/2 h-1/2 bg-[var(--neon-purple)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[var(--neon-blue)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-b border-[var(--glass-border)] z-10">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-xl flex items-center justify-center">
            <Atom className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg">MolGAN AI</h1>
            <p className="text-xs text-muted-foreground">Molecular Generation Assistant</p>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Area (70%) */}
        <div className="flex-1 flex flex-col" style={{ width: '70%' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                  <Atom className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl mb-3">Describe your molecule to begin</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Use natural language to describe the molecular properties you need. Adjust the sliders on the right to set constraints.
                </p>
                <div className="grid gap-3 w-full max-w-lg">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(prompt)}
                      className="px-6 py-3 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] hover:border-[var(--neon-blue)]/50 rounded-xl transition-all text-left group"
                    >
                      <span className="text-sm text-foreground group-hover:text-[var(--neon-blue)] transition-colors">
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    molecule={message.molecule}
                    onRegenerate={message.molecule ? handleRegenerate : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <InputBar onSubmit={handleSubmit} isGenerating={isGenerating} />
        </div>

        {/* Right: Property Panel (30%) */}
        <div className="flex-shrink-0" style={{ width: '30%' }}>
          <PropertyPanel properties={properties} onPropertyChange={handlePropertyChange} />
        </div>
      </div>
    </div>
  );
}
