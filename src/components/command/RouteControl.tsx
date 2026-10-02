import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  Navigation,
  RotateCcw,
  Compass,
  MapPin,
  Flame,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const RouteControl: React.FC = () => {
  const {
    nodes,
    edges,
    blockedEdgeIds,
    startLocation,
    destination,
    setStartLocation,
    setDestination,
    calculateRoute,
    simulatePathBlockage,
    resetEmergencyState,
    blockEdge,
    restoreEdge,
    isCalculating,
  } = useEmergency();

  const [quickEdgeId, setQuickEdgeId] = useState<string>('edge-CORR_A-MAIN_HALL');

  const locationOptions = [
    { id: 'R101', name: 'Room 101' },
    { id: 'CORR_A', name: 'Corridor A' },
    { id: 'MAIN_HALL', name: 'Main Hall' },
    { id: 'CORR_B', name: 'Corridor B' },
    { id: 'STAIRS_A', name: 'Staircase A' },
    { id: 'LAB', name: 'Laboratory' },
    { id: 'EXIT_A', name: 'Exit A (West)' },
    { id: 'EXIT_B', name: 'Exit B (North)' },
    { id: 'EXIT_C', name: 'Exit C (East)' },
  ];

  const destinationOptions = [
    { id: 'EXIT_C', name: 'Exit C (East Loading Dock - Primary)' },
    { id: 'auto', name: 'Automatic Best Exit (Dijkstra Min-Cost)' },
    { id: 'EXIT_A', name: 'Exit A (West Ground Egress)' },
    { id: 'EXIT_B', name: 'Exit B (North Perimeter Gate)' },
    { id: 'MAIN_HALL', name: 'Main Hall (Assembly Safe Area)' },
  ];

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const isQuickEdgeBlocked = blockedEdgeIds.has(quickEdgeId);

  return (
    <div className="bg-command-900/90 backdrop-blur-md rounded-xl border border-command-border p-4.5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Evacuation Route Planner
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
          DIJKSTRA ENGINE
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Start Location Dropdown */}
        <div>
          <label className="block text-[11px] font-mono font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Starting Location (Origin Node)
            </span>
            <span className="text-[10px] text-slate-400">Current position</span>
          </label>
          <select
            value={startLocation}
            onChange={e => setStartLocation(e.target.value)}
            className="w-full bg-command-950 border border-command-border rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {locationOptions.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Dropdown */}
        <div>
          <label className="block text-[11px] font-mono font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              Target Destination (Exit Gateway)
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Dynamic Egress</span>
          </label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            className="w-full bg-command-950 border border-command-border rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {destinationOptions.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons: Calculate Route & Reset */}
        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={() => calculateRoute()}
            disabled={isCalculating}
            className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-mono text-xs font-semibold tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-900/40 cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            <span>{isCalculating ? 'Computing Path...' : 'Calculate Route'}</span>
          </button>

          <button
            onClick={resetEmergencyState}
            className="py-2 px-3 rounded-lg bg-command-950 hover:bg-command-800 text-slate-300 hover:text-white border border-command-border font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reset Emergency State & Baseline Graph"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* Simulate Path Blockage Button (Requirement 10 & 16) */}
        <div className="pt-2 border-t border-command-border/70">
          <button
            onClick={simulatePathBlockage}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-red-950/80 via-red-900/70 to-amber-950/80 hover:from-red-900 hover:to-amber-900 text-red-200 border border-red-500/50 font-mono text-xs font-bold tracking-wide transition-all shadow-lg shadow-red-950/30 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Simulate Path Blockage</span>
          </button>
          <p className="text-[10px] text-slate-400 font-mono mt-1 text-center">
            Triggers Room 101 route → blocks Corridor A ↔ Main Hall → runs real Dijkstra rerun
          </p>
        </div>

        {/* Direct Corridor Interdiction (Requirement 2 & 9) */}
        <div className="pt-2 border-t border-command-border/50">
          <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1.5 flex items-center justify-between">
            <span>Direct Path Block / Restore</span>
            <span className="text-[9px] text-cyan-400">Map & Graph Sync</span>
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={quickEdgeId}
              onChange={e => setQuickEdgeId(e.target.value)}
              className="flex-1 bg-command-950 border border-command-border rounded-lg px-2 py-1.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              {edges.map(e => {
                const f = nodeMap.get(e.from)?.name || e.from;
                const t = nodeMap.get(e.to)?.name || e.to;
                const isBlk = blockedEdgeIds.has(e.id) || e.status === 'blocked';
                return (
                  <option key={e.id} value={e.id}>
                    {f} ↔ {t} ({e.weight}m) {isBlk ? '[BLOCKED]' : ''}
                  </option>
                );
              })}
            </select>

            {isQuickEdgeBlocked ? (
              <button
                onClick={() => restoreEdge(quickEdgeId)}
                className="py-1.5 px-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                title="Restore selected path"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Restore</span>
              </button>
            ) : (
              <button
                onClick={() => blockEdge(quickEdgeId)}
                className="py-1.5 px-2.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                title="Block selected path"
              >
                <Ban className="w-3 h-3" />
                <span>Block</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
