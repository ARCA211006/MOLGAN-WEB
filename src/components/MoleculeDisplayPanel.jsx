import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Tabs from "@radix-ui/react-tabs";

const ATOM_COLORS = {
  C: "#6b7280", // Gray
  O: "#ef4444", // Red
  N: "#3b82f6", // Blue
  F: "#10b981", // Green
  H: "#d1d5db", // Light Gray
  S: "#eab308", // Yellow
  P: "#f97316", // Orange
  Cl: "#22c55e", // Greenish
};

const MatrixView = ({ atoms, bonds }) => {
  const size = atoms.length;
  const adjacencyMatrix = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0));

  bonds.forEach((bond) => {
    if (bond.from < size && bond.to < size) {
      adjacencyMatrix[bond.from][bond.to] = bond.type;
      adjacencyMatrix[bond.to][bond.from] = bond.type;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-black/40 rounded-2xl p-6 border border-white/5 overflow-x-auto shadow-inner">
        <table className="text-[10px] font-mono w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-8 h-8"></th>
              {atoms.map((_, i) => (
                <th key={i} className="w-8 h-8 text-center text-muted-foreground/50 font-normal">
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adjacencyMatrix.map((row, i) => (
              <tr key={i}>
                <td className="text-muted-foreground/50 text-center font-normal">{i}</td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`text-center w-8 h-8 rounded-lg transition-colors ${
                      cell > 0
                        ? "text-[var(--neon-blue)] bg-[var(--neon-blue)]/10 border border-[var(--neon-blue)]/20 font-bold"
                        : "text-muted-foreground/10 border border-white/2"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {atoms.map((atom, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-xl border border-white/5 shadow-sm"
          >
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">Node {i}</span>
            <span className="text-xs font-bold text-[var(--neon-purple)]">{atom.element}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MoleculeDisplayPanel = ({ atoms, bonds }) => {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState("graph");

  useEffect(() => {
    if (activeTab !== "graph") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2.5;
    bonds.forEach((bond) => {
      const from = atoms[bond.from];
      const to = atoms[bond.to];
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      if (bond.type > 1) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (-dy / len) * 5;
        const offsetY = (dx / len) * 5;

        ctx.beginPath();
        ctx.moveTo(from.x + offsetX, from.y + offsetY);
        ctx.lineTo(to.x + offsetX, to.y + offsetY);
        ctx.stroke();

        if (bond.type === 3) {
          ctx.beginPath();
          ctx.moveTo(from.x - offsetX, from.y - offsetY);
          ctx.lineTo(to.x - offsetX, to.y - offsetY);
          ctx.stroke();
        }
      }
    });

    atoms.forEach((atom) => {
      const color = ATOM_COLORS[atom.element] || "#9ca3af";
      const glow = ctx.createRadialGradient(atom.x, atom.y, 0, atom.x, atom.y, 18);
      glow.addColorStop(0, color + "44");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color + "66";
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(atom.element, atom.x, atom.y);
    });
  }, [atoms, bonds, activeTab]);

  return (
    <div className="relative w-full h-full bg-black/10 rounded-3xl border border-white/5 overflow-hidden group shadow-2xl flex flex-col">
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <Tabs.List className="flex gap-1 p-1 bg-white/2 border-b border-white/5">
          <Tabs.Trigger
            value="graph"
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all data-[state=active]:bg-white/5 data-[state=active]:text-[var(--neon-blue)] data-[state=active]:shadow-lg"
          >
            Graph Layout
          </Tabs.Trigger>
          <Tabs.Trigger
            value="matrix"
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all data-[state=active]:bg-white/5 data-[state=active]:text-[var(--neon-purple)] data-[state=active]:shadow-lg"
          >
            Structural Matrix
          </Tabs.Trigger>
        </Tabs.List>

        <div className="flex-1 relative min-h-0">
          <Tabs.Content value="graph" className="h-full outline-none">
            <motion.canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </Tabs.Content>
          <Tabs.Content value="matrix" className="h-full p-6 overflow-y-auto custom-scrollbar outline-none">
            <MatrixView atoms={atoms} bonds={bonds} />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <div className="absolute bottom-4 left-4 pointer-events-none">
         <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">
            Realtime_Engine v1.0
         </div>
      </div>
    </div>
  );
};

export default MoleculeDisplayPanel;
