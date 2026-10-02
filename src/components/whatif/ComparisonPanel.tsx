import React, { useMemo } from 'react';
import { WhatIfState } from './ScenarioBuilder';
import { useEmergency } from '../../context/EmergencyContext';
import { computeEvacuationRoute } from '../../routing/routeService';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Footprints,
  Clock,
  ShieldCheck,
  DoorOpen,
  Ban,
  Radio,
} from 'lucide-react';
import { PathEdge } from '../../types/graph';

interface ComparisonPanelProps {
  state: WhatIfState;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ state }) => {
  const {
    nodes,
    edges,
    blockedEdgeIds,
    startLocation,
    destination,
    activeRoute,
    blockEdge,
    setNodeAvailability,
    addToast,
  } = useEmergency();

  const isAnyActive =
    state.corridorBlocked ||
    state.exitDisabled ||
    state.congestionIncreased ||
    state.multipleBlockages;

  // Compute live current route
  const current = useMemo(() => {
    if (activeRoute && activeRoute.status !== 'NO ROUTE FOUND') {
      return {
        exit: `${activeRoute.destinationName}`,
        distance: activeRoute.distance,
        time: activeRoute.estimatedTime,
        availablePaths: edges.filter(e => !blockedEdgeIds.has(e.id) && e.status !== 'blocked').length,
        path: activeRoute.pathNames,
        costFactor: '1.0x',
      };
    }
    return {
      exit: 'None (Blocked)',
      distance: 0,
      time: '--',
      availablePaths: edges.filter(e => !blockedEdgeIds.has(e.id) && e.status !== 'blocked').length,
      path: ['No open path'],
      costFactor: '1.0x',
    };
  }, [activeRoute, edges, blockedEdgeIds]);

  // Compute temporary simulated route using REAL Dijkstra on a cloned graph
  const simulated = useMemo(() => {
    // Clone nodes and edges
    const tempNodes = nodes.map(n => ({ ...n }));
    const tempEdges = edges.map(e => ({ ...e }));
    const tempBlocked = new Set(blockedEdgeIds);

    let impact = 'Baseline Route Active (No disruption)';
    let impactType: 'neutral' | 'diverted' | 'delayed' | 'critical' = 'neutral';

    if (state.multipleBlockages) {
      tempBlocked.add('edge-CORR_A-MAIN_HALL');
      tempBlocked.add('edge-MAIN_HALL-CORR_B');
      impact = 'Compound barriers: Corridor A and Corridor B isolated simultaneously.';
      impactType = 'critical';
    } else if (state.exitDisabled) {
      const exitB = tempNodes.find(n => n.id === 'EXIT_B');
      if (exitB) exitB.available = false;
      tempBlocked.add('edge-CORR_A-EXIT_B');
      tempBlocked.add('edge-MAIN_HALL-EXIT_B');
      tempBlocked.add('edge-LAB-EXIT_B');
      impact = 'Exit B perimeter gate locked; automatic fallback to alternate exit gates.';
      impactType = 'diverted';
    } else if (state.corridorBlocked) {
      tempBlocked.add('edge-MAIN_HALL-CORR_B');
      tempBlocked.add('edge-CORR_B-LAB');
      impact = 'Corridor B fire barrier deployed; East Wing corridors isolated.';
      impactType = 'diverted';
    } else if (state.congestionIncreased) {
      // Congestion: increase Main Hall edge weights by 2.5x and mark warning
      tempEdges.forEach(e => {
        if (e.from === 'MAIN_HALL' || e.to === 'MAIN_HALL') {
          e.status = 'warning';
          e.weight = Math.round(e.weight * 2.5);
        }
      });
      impact = 'Severe occupant density in Main Hall; walking speeds throttled by +150%.';
      impactType = 'delayed';
    }

    // Run real Dijkstra on temporary state
    const result = computeEvacuationRoute(
      { nodes: tempNodes, edges: tempEdges },
      startLocation,
      destination,
      tempBlocked,
      { isRerun: true, rerunReason: 'What-If Contingency Simulation' }
    );

    const availableCount = tempEdges.filter(e => !tempBlocked.has(e.id) && e.status !== 'blocked').length;

    // Deltas
    const distDeltaVal = result.distance - current.distance;
    const distDeltaStr = distDeltaVal > 0 ? `+${distDeltaVal}m` : distDeltaVal < 0 ? `${distDeltaVal}m` : '0m';

    const parseSec = (s: string) => {
      const m = s.match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    };
    const timeDeltaVal = parseSec(result.estimatedTime) - parseSec(current.time);
    const timeDeltaStr = timeDeltaVal > 0 ? `+${timeDeltaVal}s` : timeDeltaVal < 0 ? `${timeDeltaVal}s` : '0s';

    return {
      exit: result.status === 'NO ROUTE FOUND' ? 'No Reachable Exit' : result.destinationName,
      distance: result.distance,
      time: result.estimatedTime,
      availablePaths: availableCount,
      path: result.pathNames.length > 0 ? result.pathNames : ['All egress paths blocked'],
      impact,
      impactType,
      timeDelta: timeDeltaStr,
      distDelta: distDeltaStr,
      status: result.status,
    };
  }, [state, nodes, edges, blockedEdgeIds, startLocation, destination, current]);

  // Optional: Deploy scenario to live system
  const handleDeployToLive = () => {
    if (state.multipleBlockages) {
      blockEdge('edge-CORR_A-MAIN_HALL', 'What-If Compound Scenario Applied to Live Command');
      blockEdge('edge-MAIN_HALL-CORR_B', 'What-If Compound Scenario Applied to Live Command');
    } else if (state.corridorBlocked) {
      blockEdge('edge-MAIN_HALL-CORR_B', 'What-If Corridor B Isolation Applied to Live Command');
    } else if (state.exitDisabled) {
      setNodeAvailability('EXIT_B', false);
      blockEdge('edge-MAIN_HALL-EXIT_B', 'Exit B Lockdown Applied');
    }
    addToast('What-If scenario parameters promoted to Live Emergency State.', 'warning');
  };

  return (
    <div className="space-y-4">
      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CURRENT ROUTE PANEL */}
        <div className="bg-command-900/90 rounded-xl border border-command-border p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                CURRENT LIVE ROUTE
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                Active facility state from origin [{startLocation}]
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-command-800 text-slate-300 border border-command-700 text-xs font-mono font-bold">
              LIVE STATE
            </span>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            {/* Exit */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-command-950 border border-command-border/60">
              <span className="text-slate-400">Designated Exit:</span>
              <span className="text-emerald-400 font-bold">{current.exit}</span>
            </div>

            {/* Distance & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-command-950 border border-command-border/60">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                  <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                  Distance
                </div>
                <div className="text-lg font-bold text-white">
                  {current.distance} <span className="text-xs text-slate-400 font-normal">meters</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-command-950 border border-command-border/60">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Estimated Time
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {current.time}
                </div>
              </div>
            </div>

            {/* Available Paths */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-command-950 border border-command-border/60">
              <span className="text-slate-400">Operational Corridors:</span>
              <span className="text-slate-200 font-semibold">{current.availablePaths} / 11 paths</span>
            </div>

            {/* Path Nodes */}
            <div className="pt-2 border-t border-command-border/50">
              <span className="text-[10px] text-slate-400 block mb-1.5">Sequential Path:</span>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                {current.path.map((node, i) => (
                  <React.Fragment key={i}>
                    <span className="px-2 py-0.5 rounded bg-command-950 text-slate-300 border border-command-border">
                      {node}
                    </span>
                    {i < current.path.length - 1 && (
                      <span className="text-slate-500">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIMULATED ROUTE PANEL */}
        <div className={`bg-command-900/90 rounded-xl border p-5 shadow-xl transition-all duration-300 ${
          isAnyActive ? 'border-cyan-500/50 shadow-cyan-950/30' : 'border-command-border'
        }`}>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                SIMULATED ROUTE (DIJKSTRA)
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time calculated contingency response
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
              simulated.status === 'NO ROUTE FOUND'
                ? 'bg-red-950 text-red-300 border-red-800'
                : simulated.impactType === 'diverted'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                : simulated.impactType === 'delayed'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-command-800 text-slate-300 border-command-700'
            }`}>
              {simulated.status === 'NO ROUTE FOUND' ? 'BLOCKED' : simulated.impactType === 'diverted' ? 'REROUTED' : simulated.impactType === 'delayed' ? 'DELAYED' : 'UNALTERED'}
            </span>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            {/* Exit */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-command-950 border border-command-border/60">
              <span className="text-slate-400">Recalculated Exit:</span>
              <span className={`font-bold ${simulated.status === 'NO ROUTE FOUND' ? 'text-red-400' : 'text-emerald-300'}`}>
                {simulated.exit}
              </span>
            </div>

            {/* Distance & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-command-950 border border-command-border/60">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                    Distance
                  </span>
                  {isAnyActive && (
                    <span className="text-cyan-400 font-semibold">{simulated.distDelta}</span>
                  )}
                </div>
                <div className="text-lg font-bold text-white">
                  {simulated.distance} <span className="text-xs text-slate-400 font-normal">meters</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-command-950 border border-command-border/60">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Estimated Time
                  </span>
                  {isAnyActive && (
                    <span className={simulated.timeDelta.startsWith('-') ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {simulated.timeDelta}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-cyan-300">
                  {simulated.time}
                </div>
              </div>
            </div>

            {/* Available Paths */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-command-950 border border-command-border/60">
              <span className="text-slate-400">Remaining Operational Paths:</span>
              <span className="text-cyan-400 font-semibold">{simulated.availablePaths} / 11 corridors</span>
            </div>

            {/* Path Nodes */}
            <div className="pt-2 border-t border-command-border/50">
              <span className="text-[10px] text-cyan-400 block mb-1.5">Recalculated Node Chain:</span>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                {simulated.path.map((node, i) => (
                  <React.Fragment key={i}>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-800">
                      {node}
                    </span>
                    {i < simulated.path.length - 1 && (
                      <span className="text-cyan-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Analysis Banner */}
      <div className="p-3.5 rounded-xl bg-command-900 border border-command-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-semibold">What-If Evaluator Diagnostic:</span>
          <span className="text-slate-400">{simulated.impact}</span>
        </div>

        {isAnyActive && (
          <button
            onClick={handleDeployToLive}
            className="px-3 py-1.5 rounded-lg bg-command-800 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Apply Scenario to Live State</span>
          </button>
        )}
      </div>
    </div>
  );
};
