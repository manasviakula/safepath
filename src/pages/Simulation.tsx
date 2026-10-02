import React, { useState } from 'react';
import { DEMO_SCENARIOS } from '../data/scenarios';
import { SimulationScenario } from '../types/simulation';
import { ScenarioCard } from '../components/simulation/ScenarioCard';
import { SimulationTimeline } from '../components/simulation/SimulationTimeline';
import { useEmergency } from '../context/EmergencyContext';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';

export const Simulation: React.FC = () => {
  const { blockEdge, restoreEdge, addToast } = useEmergency();
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(DEMO_SCENARIOS[0]);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);

  const handleSelectScenario = (sc: SimulationScenario) => {
    setActiveScenario(sc);
    setSimulationRunning(true);
    // Apply blocked edges from scenario
    sc.blockedEdgeIds.forEach(id => blockEdge(id));
    addToast(`Drill scenario started: "${sc.title}". Dynamic route recomputation executed.`, 'warning');
  };

  const handleResetSimulation = () => {
    setSimulationRunning(false);
    activeScenario.blockedEdgeIds.forEach(id => restoreEdge(id));
    addToast('Simulation halted. Facility paths restored.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header Banner */}
      <div className="bg-command-900/90 rounded-xl border border-command-border p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-base font-mono font-bold uppercase tracking-wider text-white">
              Dynamic Emergency Simulation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Stress-test facility graph under severe hazard scenarios and evaluate automated rerouting resilience.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-command-950 border border-command-border text-xs font-mono">
            <span className="text-slate-400">Simulation Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {simulationRunning ? 'ACTIVE DRILL' : 'STANDBY'}
            </span>
          </div>

          <button
            onClick={handleResetSimulation}
            className="px-3 py-1.5 rounded-lg bg-command-950 hover:bg-command-800 text-slate-300 hover:text-white border border-command-border font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Drill</span>
          </button>
        </div>
      </div>

      {/* 4 Scenario Cards Grid */}
      <div>
        <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 tracking-wider">
          Preset Evacuation Drill Scenarios
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_SCENARIOS.map(sc => (
            <ScenarioCard
              key={sc.id}
              scenario={sc}
              isActive={activeScenario.id === sc.id && simulationRunning}
              onSelect={handleSelectScenario}
            />
          ))}
        </div>
      </div>

      {/* Simulation Active Results & Timeline */}
      <SimulationTimeline scenario={activeScenario} />
    </div>
  );
};
