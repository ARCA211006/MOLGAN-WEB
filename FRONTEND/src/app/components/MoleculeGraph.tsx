import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface Atom {
  element: string;
  x: number;
  y: number;
}

interface Bond {
  from: number;
  to: number;
  type: number; // 1 = single, 2 = double, 3 = triple
}

interface MoleculeGraphProps {
  atoms: Atom[];
  bonds: Bond[];
}

const ATOM_COLORS: Record<string, string> = {
  C: "#6b7280",
  O: "#ef4444",
  N: "#3b82f6",
  F: "#10b981",
  H: "#d1d5db",
  S: "#eab308",
  P: "#f97316",
  Cl: "#22c55e",
};

export function MoleculeGraph({ atoms, bonds }: MoleculeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

    // Draw bonds
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    bonds.forEach((bond) => {
      const from = atoms[bond.from];
      const to = atoms[bond.to];

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Draw additional lines for double/triple bonds
      if (bond.type > 1) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (-dy / len) * 4;
        const offsetY = (dx / len) * 4;

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

    // Draw atoms
    atoms.forEach((atom) => {
      const color = ATOM_COLORS[atom.element] || "#9ca3af";

      // Outer glow
      const gradient = ctx.createRadialGradient(atom.x, atom.y, 0, atom.x, atom.y, 20);
      gradient.addColorStop(0, color + "40");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Atom circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Element label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(atom.element, atom.x, atom.y);
    });
  }, [atoms, bonds]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
}
