interface MatrixViewProps {
  atoms: Array<{ element: string }>;
  bonds: Array<{ from: number; to: number; type: number }>;
}

export function MatrixView({ atoms, bonds }: MatrixViewProps) {
  const size = atoms.length;

  // Create adjacency matrix
  const adjacencyMatrix = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0));

  bonds.forEach((bond) => {
    adjacencyMatrix[bond.from][bond.to] = bond.type;
    adjacencyMatrix[bond.to][bond.from] = bond.type;
  });

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs text-muted-foreground mb-3">Adjacency Matrix</h4>
        <div className="bg-black/30 rounded-lg p-4 border border-white/5 overflow-x-auto">
          <table className="text-xs font-mono">
            <thead>
              <tr>
                <th className="w-6"></th>
                {atoms.map((_, i) => (
                  <th key={i} className="w-6 text-center text-muted-foreground pb-2">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adjacencyMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="text-muted-foreground pr-2">{i}</td>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`text-center w-6 h-6 ${
                        cell > 0
                          ? "text-[var(--neon-blue)] bg-[var(--neon-blue)]/10"
                          : "text-muted-foreground/30"
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
      </div>

      <div>
        <h4 className="text-xs text-muted-foreground mb-3">Node Features</h4>
        <div className="bg-black/30 rounded-lg p-4 border border-white/5">
          <div className="grid grid-cols-2 gap-2">
            {atoms.map((atom, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 bg-white/5 rounded border border-white/5"
              >
                <span className="text-xs text-muted-foreground">Node {i}</span>
                <span className="text-xs text-[var(--neon-purple)]">{atom.element}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
