import React from 'react';

export const MapLegend: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div
      className={`bg-command-900/90 backdrop-blur-md rounded-lg border border-command-border text-xs font-mono ${
        compact ? 'p-2.5' : 'p-3.5'
      }`}
    >
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
        Facility Map Status Legend
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Available Path */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-1 bg-emerald-500 rounded-full shrink-0" />
          <span className="text-slate-300 text-[11px]">Available Path</span>
        </div>

        {/* Calculated Evacuation Route */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-1 bg-cyan-400 shadow-[0_0_8px_#38bdf8] rounded-full shrink-0 animate-pulse" />
          <span className="text-cyan-300 font-semibold text-[11px]">Active Route</span>
        </div>

        {/* Blocked Path */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-1 border-b-2 border-dashed border-red-500 rounded-full shrink-0" />
          <span className="text-red-400 text-[11px]">Blocked (Hazard)</span>
        </div>

        {/* Warning / Congestion */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-1 bg-amber-500 rounded-full shrink-0" />
          <span className="text-amber-400 text-[11px]">Warning / Delay</span>
        </div>

        {/* Start Point */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500 border-2 border-white shrink-0 shadow-[0_0_8px_#38bdf8]" />
          <span className="text-slate-300 text-[11px]">Start Location</span>
        </div>

        {/* Exit Portal */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500 flex items-center justify-center text-[8px] font-bold text-black shrink-0">
            E
          </span>
          <span className="text-emerald-400 font-semibold text-[11px]">Evacuation Exit</span>
        </div>
      </div>
    </div>
  );
};
