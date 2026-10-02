import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { History, GitCommit, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';

export const RouteHistoryCard: React.FC = () => {
  const { routeHistory } = useEmergency();

  if (routeHistory.length === 0) return null;

  return (
    <div className="bg-command-900/90 backdrop-blur-md rounded-xl border border-command-border p-4.5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-command-border">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Route History & Rerouting Log
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-slate-400 border border-command-border">
          {routeHistory.length} event{routeHistory.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
        {routeHistory.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-2.5 rounded-lg bg-command-950/80 border border-command-border/70 hover:border-cyan-500/30 transition-colors font-mono text-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="font-semibold text-slate-200">
                  {item.timestamp} — {item.event}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                {item.distanceDelta !== '0m' && (
                  <span className={item.distanceDelta.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'}>
                    Dist: {item.distanceDelta}
                  </span>
                )}
                <span className="text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                  {item.selectedExit}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug mb-1.5">
              {item.reason}
            </p>

            {item.previousPathNames.length > 0 && (
              <div className="text-[10px] text-slate-500 flex items-center gap-1 flex-wrap pt-1 border-t border-command-border/40">
                <span className="text-slate-400">Path:</span>
                <span className="text-slate-400 line-through">
                  {item.previousPathNames.slice(-2).join(' → ')}
                </span>
                <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-cyan-300 font-semibold">
                  {item.newPathNames.slice(-2).join(' → ')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
