import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "motion/react";

interface InputBarProps {
  onSubmit: (message: string) => void;
  isGenerating?: boolean;
}

export function InputBar({ onSubmit, isGenerating }: InputBarProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-[var(--glass-bg)] backdrop-blur-xl border-2 border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden group hover:border-[var(--neon-blue)]/30 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the molecule you want..."
            disabled={isGenerating}
            className="w-full px-6 py-4 pr-16 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-lg"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        {isGenerating && (
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-1">
              <motion.div
                className="w-2 h-2 bg-[var(--neon-blue)] rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-[var(--neon-purple)] rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-[var(--neon-green)] rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              />
            </div>
            <span>Generating molecule...</span>
          </motion.div>
        )}
      </form>
    </div>
  );
}
