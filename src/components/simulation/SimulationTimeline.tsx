import React from 'react';
import { SimulationScenario } from '../../types/simulation';
import { TIMELINE_EVENTS } from '../../data/scenarios';
import { Clock, ShieldAlert, ArrowRight, CheckCircle2, RotateCw } from 'lucide-react';

interface SimulationTimelineProps {
  scenario: SimulationScenario;
}

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({ scenario }) => {
  return (
    <div className="space-y-6">
      {/* Route Transition Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline / Current Route */}
        <div className="bg-command-900/90 rounded-xl border border-command-border p-4.5">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-command-border">
            <span className="text-xs font-mono font-bold uppercase text-slate-300">
              Initial Target Route (Compromised)
            </span>
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono">
              OBSTRUCTED
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Destination:</span>
              <span className="text-white font-medium">{scenario.initialRoute.exit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Estimated Distance:</span>
              <span className="text-slate-200">{scenario.initialRoute.distance}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Traversal Time:</span>
              <span className="text-slate-200">{scenario.initialRoute.time}</span>
            </div>

            <div className="pt-2 border-t border-command-border/60">
              <span className="text-[10px] text-slate-400 block mb-1">Transit Nodes:</span>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                {scenario.initialRoute.path.map((node, i) => (
                  <React.Fragment key={i}>
                    <span className="px-2 py-0.5 rounded bg-command-950 text-slate-300 border border-command-border">
                      {node}
                    </span>
                    {i < scenario.initialRoute.path.length - 1 && (
                      <span className="text-slate-500">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic New Route */}
        <div className="bg-command-900/90 rounded-xl border border-cyan-500/40 p-4.5 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-cyan-500/20">
            <span className="text-xs font-mono font-bold uppercase text-cyan-300">
              SafePath Dynamic Recalculated Route
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              OPTIMAL
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Safe Egress:</span>
              <span className="text-emerald-300 font-bold">{scenario.reroutedRoute.exit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recalculated Distance:</span>
              <span className="text-white font-semibold">{scenario.reroutedRoute.distance}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Traversal Time:</span>
              <span className="text-emerald-400 font-semibold">{scenario.reroutedRoute.time}</span>
            </div>

            <div className="pt-2 border-t border-command-border/60">
              <span className="text-[10px] text-cyan-400 block mb-1">Dijkstra Bypass Nodes:</span>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                {scenario.reroutedRoute.path.map((node, i) => (
                  <React.Fragment key={i}>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-800/80">
                      {node}
                    </span>
                    {i < scenario.reroutedRoute.path.length - 1 && (
                      <span className="text-cyan-400">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Progression Timeline */}
      <div className="bg-command-900/90 rounded-xl border border-command-border p-4.5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Emergency Progression Timeline (T-Zero Sequence)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Automated Sensor Trigger Sequence
          </span>
        </div>

        <div className="space-y-3">
          {TIMELINE_EVENTS.map(evt => (
            <div
              key={evt.id}
              className="flex items-start gap-3.5 p-3 rounded-lg bg-command-950/70 border border-command-border/70 text-xs font-mono"
            >
              <div className="px-2 py-0.5 rounded bg-command-800 text-cyan-400 font-bold shrink-0 text-[11px]">
                {evt.timeOffset}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-200 font-semibold">
                    {evt.description}
                  </span>
                  <span className="text-[10px] text-slate-400">{evt.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Event ID: {evt.id}</span>
                  <span>•</span>
                  <span
                    className={
                      evt.severity === 'Critical'
                        ? 'text-red-400 font-bold'
                        : evt.severity === 'High'
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }
                  >
                    Level: {evt.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
