import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  CheckCircle2,
  AlertOctagon,
  Clock,
  Footprints,
  Cpu,
  GitFork,
  Loader2,
  Ban,
  DoorClosed,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const RouteResultCard: React.FC = () => {
  const {
    activeRoute,
    rerouteState,
    rerouteBlockedEdgeLabel,
    blockedEdgeIds,
    edges,
    nodes,
    resetEmergencyState,
  } = useEmergency();

  if (!activeRoute) {
    return (
      <div className="bg-command-900/90 backdrop-blur-md rounded-xl border border-command-border p-5 text-center text-xs font-mono text-slate-400">
        Initiate route calculation to preview optimal evacuation guidance.
      </div>
    );
  }

  const isNoRoute = activeRoute.status === 'NO ROUTE FOUND' || rerouteState === 'no_route';
  const isBlocked = rerouteState === 'blocked_detected';
  const isRecalculating = rerouteState === 'recalculating';
  const isRerouted = rerouteState === 'rerouted';
  const isAvailable = activeRoute.status === 'ROUTE AVAILABLE' && !isBlocked && !isNoRoute;

  // For NO ROUTE FOUND state (Requirement 14)
  if (isNoRoute) {
    const blockedEdges = edges.filter(e => blockedEdgeIds.has(e.id) || e.status === 'blocked');
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const unavailableExits = nodes.filter(n => n.type === 'exit' && !n.available);

    return (
      <div className="bg-red-950/30 backdrop-blur-md rounded-xl border border-red-500/60 p-4.5 shadow-2xl transition-all">
        {/* Header Alert */}
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-red-900/50">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-300">
              NO AVAILABLE EVACUATION ROUTE
            </span>
          </div>
          <Badge variant="critical" pulse={true} size="md">
            ISOLATED
          </Badge>
        </div>

        {/* Message */}
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-900/60 mb-3 text-xs font-mono text-red-200 leading-relaxed">
          <p className="font-semibold text-red-300 mb-1">
            All reachable evacuation paths are currently unavailable.
          </p>
          <p className="text-[11px] text-red-300/80">
            Dijkstra shortest-path traversal found zero open corridors connecting origin [
            {activeRoute.startName}] to any operational facility egress gate.
          </p>
        </div>

        {/* Blocked Paths List */}
        <div className="space-y-2 mb-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
              <Ban className="w-3.5 h-3.5 text-red-400" />
              Active Path Blockages ({blockedEdges.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {blockedEdges.map(e => {
                const f = nodeMap.get(e.from)?.name || e.from;
                const t = nodeMap.get(e.to)?.name || e.to;
                return (
                  <span
                    key={e.id}
                    className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px]"
                  >
                    {f} ↔ {t}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Unavailable Exits */}
          {unavailableExits.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
                <DoorClosed className="w-3.5 h-3.5 text-amber-400" />
                Compromised Egress Gates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {unavailableExits.map(x => (
                  <span
                    key={x.id}
                    className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px]"
                  >
                    {x.name} (Closed)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Action */}
        <div className="p-3 rounded-lg bg-command-950 border border-command-border/80 mb-3.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Mandatory Emergency Protocol:
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Shelter in place inside nearest structural room. Seal ventilation ducts, activate
            localized distress beacon, and stand by for first responder breach & rescue.
          </p>
        </div>

        {/* Reset / Recover Button */}
        <button
          onClick={resetEmergencyState}
          className="w-full py-2 px-3 rounded-lg bg-command-800 hover:bg-command-700 text-slate-200 border border-command-border font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Emergency State & Clear Blockages</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-command-900/90 backdrop-blur-md rounded-xl border border-command-border p-4.5 shadow-xl transition-all">
      {/* Header and Route Status Badge */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-command-border">
        <div className="flex items-center gap-2">
          {isBlocked ? (
            <AlertOctagon className="w-4 h-4 text-red-400 animate-bounce" />
          ) : isRecalculating ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : isRerouted ? (
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          ) : isAvailable ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertOctagon className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Route Result
          </span>
        </div>

        {isBlocked ? (
          <Badge variant="critical" pulse={true} size="md">
            ACTIVE ROUTE BLOCKED
          </Badge>
        ) : isRecalculating ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            RECALCULATING…
          </span>
        ) : isRerouted ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            ALTERNATIVE ROUTE FOUND
          </span>
        ) : (
          <Badge
            variant={isAvailable ? 'success' : 'critical'}
            pulse={isAvailable}
            size="md"
          >
            {activeRoute.status}
          </Badge>
        )}
      </div>

      {/* Recalculating state banner */}
      {isRecalculating && (
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 mb-3 flex items-center gap-2.5 font-mono text-xs text-amber-200">
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          <div>
            <div className="font-bold text-amber-300">RECALCULATING EVACUATION ROUTE…</div>
            <div className="text-[10px] text-amber-400/80">
              Pruning blocked edges and rerunning Dijkstra shortest-path min-heap.
            </div>
          </div>
        </div>
      )}

      {/* Active Route Blocked banner */}
      {isBlocked && (
        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/50 mb-3 flex items-center gap-2.5 font-mono text-xs text-red-200 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
          <div>
            <div className="font-bold text-red-300">ACTIVE ROUTE BLOCKED</div>
            <div className="text-[10px] text-red-300/80">
              Obstruction detected along [
              {rerouteBlockedEdgeLabel || 'active corridor'}
              ]. Route invalidated.
            </div>
          </div>
        </div>
      )}

      {/* Alternative Route Found banner */}
      {isRerouted && (
        <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 mb-3 flex items-center gap-2.5 font-mono text-xs text-cyan-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="font-bold text-cyan-300">ALTERNATIVE ROUTE FOUND</div>
            <div className="text-[10px] text-cyan-300/80">
              Dijkstra rerun identified lowest-cost alternative egress to {activeRoute.destinationName}.
            </div>
          </div>
        </div>
      )}

      {/* Traversal Summary: Start -> Destination */}
      <div className="bg-command-950/80 rounded-lg p-3 border border-command-border/80 mb-3.5">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-400 text-[10px] uppercase">Origin Point:</span>
          <span className="text-cyan-300 font-semibold">{activeRoute.startName}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase">Target Egress:</span>
          <span className="text-emerald-300 font-bold">{activeRoute.destinationName}</span>
        </div>
        {activeRoute.pathNames.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-command-border/50 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400">Path:</span>
            {activeRoute.pathNames.map((name, idx) => (
              <React.Fragment key={idx}>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    idx === activeRoute.pathNames.length - 1
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-command-800 text-slate-200'
                  }`}
                >
                  {name}
                </span>
                {idx < activeRoute.pathNames.length - 1 && (
                  <span className="text-cyan-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <div className="p-2.5 rounded-lg bg-command-950 border border-command-border">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
            <Footprints className="w-3 h-3 text-cyan-400" />
            Total Distance
          </div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
            {activeRoute.distance} <span className="text-xs text-slate-400 font-normal">meters</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-command-950 border border-command-border">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
            <Clock className="w-3 h-3 text-emerald-400" />
            Estimated Time
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {activeRoute.estimatedTime}
          </div>
        </div>
      </div>

      {/* Algorithm Specs & Diagnostic Evaluation */}
      <div className="space-y-1.5 text-[11px] font-mono pt-2 border-t border-command-border/70 text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-slate-400" />
            Algorithm:
          </span>
          <span className={activeRoute.isRerun ? 'text-cyan-300 font-bold' : 'text-slate-200'}>
            {activeRoute.algorithm}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <GitFork className="w-3 h-3 text-slate-400" />
            Nodes Evaluated:
          </span>
          <span className="text-cyan-400 font-semibold">{activeRoute.nodesEvaluated}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Edges Evaluated:</span>
          <span className="text-cyan-400 font-semibold">{activeRoute.edgesEvaluated}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Computation Latency:</span>
          <span className="text-emerald-400 font-semibold">{activeRoute.calculationTime}</span>
        </div>
      </div>
    </div>
  );
};
