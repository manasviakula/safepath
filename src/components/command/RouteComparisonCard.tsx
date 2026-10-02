import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Footprints,
  Clock,
  DoorOpen,
  Ban,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const RouteComparisonCard: React.FC = () => {
  const { routeComparison, activeRoute, dismissComparison, resetEmergencyState } = useEmergency();

  if (!routeComparison) return null;

  const { previousRoute, newRoute, distanceDelta, distanceDeltaStr, timeDelta, timeDeltaSeconds, blockedPathsCount, availableExitsCount } =
    routeComparison;

  const isMoreDistance = distanceDelta > 0;
  const isMoreTime = timeDeltaSeconds > 0;

  return (
    <div className="bg-command-900/95 backdrop-blur-md rounded-xl border border-cyan-500/40 p-4.5 shadow-2xl relative overflow-hidden animate-fadeIn">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-command-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Dynamic Rerouting Comparison
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            DIJKSTRA RERUN
          </Badge>
          <button
            onClick={dismissComparison}
            className="text-[11px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-command-950 border border-command-border hover:border-cyan-500/50 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Before / After Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
        {/* BEFORE PANEL */}
        <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
              Previous Route (Blocked)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800 text-[10px] font-bold">
              COMPROMISED
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="text-[11px]">
              <span className="text-slate-400">Exit:</span>{' '}
              <span className="text-white font-semibold">
                {previousRoute?.destinationName || 'Previous Exit'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-slate-400">Distance:</span>{' '}
                <span className="text-slate-200 font-bold">{previousRoute?.distance ?? 0}m</span>
              </div>
              <div>
                <span className="text-slate-400">ETA:</span>{' '}
                <span className="text-slate-200 font-bold">{previousRoute?.estimatedTime ?? '--'}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-red-900/30">
              <span className="block text-slate-400 mb-0.5">Route Path:</span>
              <span className="text-red-200 line-through">
                {previousRoute?.pathNames.join(' → ') || 'No previous path'}
              </span>
            </div>
          </div>
        </div>

        {/* AFTER PANEL */}
        <div className="p-3 rounded-lg bg-cyan-950/25 border border-cyan-500/40 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              New Evacuation Route
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold animate-pulse">
              ACTIVE
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="text-[11px]">
              <span className="text-slate-400">New Exit:</span>{' '}
              <span className="text-emerald-300 font-bold">{newRoute.destinationName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-slate-400">Distance:</span>{' '}
                <span className="text-white font-bold">{newRoute.distance}m</span>
              </div>
              <div>
                <span className="text-slate-400">ETA:</span>{' '}
                <span className="text-emerald-400 font-bold">{newRoute.estimatedTime}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-cyan-900/30">
              <span className="block text-cyan-400 mb-0.5">Optimal Detour:</span>
              <span className="text-cyan-200 font-semibold">
                {newRoute.pathNames.join(' → ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-command-border/70 text-xs font-mono">
        <div className="p-2 rounded bg-command-950 border border-command-border">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Footprints className="w-3 h-3 text-cyan-400" />
            Distance Delta
          </div>
          <div className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${isMoreDistance ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isMoreDistance ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {distanceDeltaStr}
          </div>
        </div>

        <div className="p-2 rounded bg-command-950 border border-command-border">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Time Delta
          </div>
          <div className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${isMoreTime ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isMoreTime ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {timeDelta}
          </div>
        </div>

        <div className="p-2 rounded bg-command-950 border border-command-border">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Ban className="w-3 h-3 text-red-400" />
            Blocked Paths
          </div>
          <div className="text-sm font-bold text-red-400 mt-0.5">
            {blockedPathsCount} path{blockedPathsCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="p-2 rounded bg-command-950 border border-command-border">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <DoorOpen className="w-3 h-3 text-emerald-400" />
            Available Exits
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {availableExitsCount} / 3 gates
          </div>
        </div>
      </div>
    </div>
  );
};
