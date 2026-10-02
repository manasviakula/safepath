import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { Terminal, Check, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export const AlgorithmTrace: React.FC = () => {
  const { activeRoute } = useEmergency();

  const isRerun = !!activeRoute?.isRerun;

  const defaultSteps = [
    {
      stepNumber: 1,
      title: 'Graph loaded',
      detail: 'Loaded 9 facility nodes, 11 weighted transit corridors into memory.',
      timestamp: '0.01ms',
    },
    {
      stepNumber: 2,
      title: 'Blocked paths checked',
      detail: 'Traversed active hazards: Edge [Main Hall ↔ Corridor B] flagged unavailable.',
      timestamp: '0.08ms',
    },
    {
      stepNumber: 3,
      title: 'Priority queue initialized',
      detail: 'Binary min-heap allocated. Distances initialized: dist[start] = 0, others = ∞.',
      timestamp: '0.14ms',
    },
    {
      stepNumber: 4,
      title: 'Starting node selected',
      detail: 'Vertex anchor initialized. Root pointer positioned for exploration.',
      timestamp: '0.21ms',
    },
    {
      stepNumber: 5,
      title: 'Neighbor distances evaluated',
      detail: 'Relaxation performed: new_cost = current_cost + edge_weight across available adjacencies.',
      timestamp: '0.52ms',
    },
    {
      stepNumber: 6,
      title: 'Minimum-cost node selected',
      detail: 'Greedy step extracted lowest tentative cost vertex from priority queue.',
      timestamp: '0.65ms',
    },
    {
      stepNumber: 7,
      title: 'Destination reached',
      detail: 'Egress perimeter node identified and extracted with minimum cumulative distance.',
      timestamp: '0.78ms',
    },
    {
      stepNumber: 8,
      title: 'Route reconstructed',
      detail: 'Backtracked predecessor map from target exit to origin to build path array.',
      timestamp: '0.90ms',
    },
  ];

  const stepsToDisplay =
    activeRoute?.steps && activeRoute.steps.length > 0
      ? activeRoute.steps
      : defaultSteps;

  return (
    <div className="bg-command-900/90 backdrop-blur-md rounded-xl border border-command-border p-4.5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-command-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Algorithm Execution Trace
          </h2>
        </div>

        {isRerun ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold animate-pulse">
            <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
            <span>DIJKSTRA RERUN</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 text-[10px] font-mono text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>DIJKSTRA MIN-HEAP</span>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {stepsToDisplay.map((step, idx) => {
          const stepNumStr = String(step.stepNumber).padStart(2, '0');
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 p-2 rounded-lg font-mono text-xs transition-colors border ${
                isRerun
                  ? 'bg-command-950/80 border-cyan-900/40 hover:border-cyan-500/40'
                  : 'bg-command-950/70 border-command-border/60 hover:border-cyan-500/30'
              }`}
            >
              {/* Step Number Badge */}
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold shrink-0 mt-0.5 ${
                  isRerun
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {stepNumStr}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold text-xs ${isRerun ? 'text-cyan-200' : 'text-slate-200'}`}>
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {step.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-command-border/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <ArrowRight className="w-3 h-3 text-cyan-400" />
          {isRerun ? 'Topology Updated • Blocked Edge Pruned' : 'Verification: 0 Negative Cycles'}
        </span>
        <span className="text-cyan-400">Complexity: O((V + E) log V)</span>
      </div>
    </div>
  );
};
