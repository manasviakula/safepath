import React from 'react';
import { SimulationScenario } from '../../types/simulation';
import { Badge } from '../common/Badge';
import { Flame, AlertTriangle, DoorClosed, Users, Play, Check } from 'lucide-react';

interface ScenarioCardProps {
  scenario: SimulationScenario;
  isActive: boolean;
  onSelect: (scenario: SimulationScenario) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isActive,
  onSelect,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-red-400" />;
      case 'DoorClosed':
        return <DoorClosed className="w-5 h-5 text-red-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div
      className={`rounded-xl border p-4.5 transition-all duration-200 flex flex-col justify-between ${
        isActive
          ? 'bg-command-900 border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
          : 'bg-command-900/80 hover:bg-command-900 border-command-border hover:border-slate-700 shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-command-950 border border-command-border">
            {getIcon(scenario.icon)}
          </div>
          <Badge
            variant={
              scenario.severity === 'Critical'
                ? 'critical'
                : scenario.severity === 'High'
                ? 'high'
                : 'medium'
            }
            size="sm"
          >
            {scenario.severity}
          </Badge>
        </div>

        <h3 className="text-sm font-mono font-bold text-white mb-1.5">
          {scenario.title}
        </h3>
        <p className="text-xs text-slate-400 font-mono leading-relaxed mb-4">
          {scenario.description}
        </p>

        <div className="space-y-1.5 mb-4 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Primary Exit:</span>
            <span className="text-slate-200">{scenario.initialRoute.exit}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Recalculated Egress:</span>
            <span className="text-emerald-400 font-semibold">{scenario.reroutedRoute.exit}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSelect(scenario)}
        className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isActive
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            : 'bg-command-950 hover:bg-command-800 text-slate-200 border border-command-border hover:border-cyan-500/30'
        }`}
      >
        {isActive ? (
          <>
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Drill</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Start Simulation</span>
          </>
        )}
      </button>
    </div>
  );
};
