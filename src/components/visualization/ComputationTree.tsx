import React from 'react';
import { useStore } from '../../store/useStore';
import type { ComputationBranch } from '../../core/types';
import { CheckCircle2, XCircle, GitBranch } from 'lucide-react';

interface TreeNodeProps {
  node: ComputationBranch;
  depth?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth = 0 }) => {
  const isLeaf = node.children.length === 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Representation */}
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs shadow-sm transition-all hover:scale-105 ${
          node.isAccepting
            ? 'border-[var(--success)] bg-[var(--success)]/15 text-[var(--success)] font-bold'
            : node.isDead
              ? 'border-[var(--danger)]/50 bg-[var(--danger)]/10 text-[var(--danger)]'
              : 'border-[var(--border-color)] bg-[var(--bg-dark)] text-[var(--text-primary)]'
        }`}
      >
        {node.symbol && (
          <span className="rounded bg-[var(--bg-card)] px-1.5 py-0.5 text-[10px] text-[var(--accent)] font-semibold border border-[var(--border-color)]">
            {node.symbol}
          </span>
        )}
        <span>{node.state}</span>
        {isLeaf && (
          <span>
            {node.isAccepting ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] inline" />
            ) : node.isDead ? (
              <XCircle className="h-3.5 w-3.5 text-[var(--danger)] inline" />
            ) : null}
          </span>
        )}
      </div>

      {/* Children branches */}
      {node.children.length > 0 && (
        <div className="mt-4 flex flex-col items-center">
          {/* Vertical connecting line */}
          <div className="h-4 w-px bg-[var(--border-color)]" />

          {/* Horizontal distribution */}
          <div className="flex gap-4 pt-1 relative">
            {node.children.map((child, idx) => (
              <div key={idx} className="relative flex flex-col items-center">
                {/* Connector line to child */}
                <div className="h-3 w-px bg-[var(--border-color)] mb-1" />
                <TreeNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function ComputationTree() {
  const { computationTree, definition } = useStore();

  if (definition.type !== 'NFA') {
    return null;
  }

  if (!computationTree) {
    return (
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center text-xs text-[var(--text-muted)]">
        Run an NFA simulation to view the nondeterministic computation tree.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[var(--primary-light)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            NFA Computation Tree
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-[var(--success)]">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" /> Accepting Leaf
          </span>
          <span className="flex items-center gap-1 text-[var(--danger)]">
            <span className="h-2 w-2 rounded-full bg-[var(--danger)]" /> Dead / Reject Branch
          </span>
        </div>
      </div>

      {/* Scrollable Tree Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-96 py-4 px-2 flex justify-center">
        <TreeNode node={computationTree} />
      </div>
    </div>
  );
}
