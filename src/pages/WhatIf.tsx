import React, { useState } from 'react';
import { ScenarioBuilder, WhatIfState } from '../components/whatif/ScenarioBuilder';
import { ComparisonPanel } from '../components/whatif/ComparisonPanel';
import { useEmergency } from '../context/EmergencyContext';
import { GitBranch, Info } from 'lucide-react';

export const WhatIf: React.FC = () => {
  const { addToast } = useEmergency();
  const [whatIfState, setWhatIfState] = useState<WhatIfState>({
    corridorBlocked: false,
    exitDisabled: false,
    congestionIncreased: false,
    multipleBlockages: false,
  });

  const handleToggle = (key: keyof WhatIfState) => {
    setWhatIfState(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const statusText = next[key] ? 'ENABLED' : 'DISABLED';
      addToast(`What-If parameter "${key}" is now ${statusText}.`, 'info');
      return next;
    });
  };

  const handleReset = () => {
    setWhatIfState({
      corridorBlocked: false,
      exitDisabled: false,
      congestionIncreased: false,
      multipleBlockages: false,
    });
    addToast('What-If scenario builder parameters reset to standard profile.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* What-If Interactive Controls */}
      <ScenarioBuilder
        state={whatIfState}
        onChange={handleToggle}
        onReset={handleReset}
      />

      {/* Side-by-side Comparative Analysis */}
      <ComparisonPanel state={whatIfState} />

      {/* Algorithmic Explanatory Note */}
      <div className="p-4 rounded-xl bg-command-900/60 border border-command-border/80 flex items-start gap-3 text-xs font-mono text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">How What-If Computations Function:</strong>{' '}
          In Stage 1, these controls demonstrate the dual-state route comparison pipeline. When Stage 2 and Stage 3 are integrated, the Dijkstra engine recalculates the complete minimum spanning tree in real-time upon any variable mutation, factoring in edge elimination, adjusted edge weights (congestion factors), and fallback egress priority.
        </p>
      </div>
    </div>
  );
};
