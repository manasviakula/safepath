import React from 'react';
import {
  Ban,
  DoorClosed,
  Users,
  Layers,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface WhatIfState {
  corridorBlocked: boolean;
  exitDisabled: boolean;
  congestionIncreased: boolean;
  multipleBlockages: boolean;
}

interface ScenarioBuilderProps {
  state: WhatIfState;
  onChange: (key: keyof WhatIfState) => void;
  onReset: () => void;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  state,
  onChange,
  onReset,
}) => {
  return (
    <div className="bg-command-900/90 rounded-xl border border-command-border p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            What-If Contingency Scenario Builder
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-command-950 hover:bg-command-800 text-slate-300 border border-command-border text-xs font-mono transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Scenario</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
        Toggle simulated architectural failure conditions below to observe the immediate route divergence, estimated egress time expansion, and bypass efficiency.
      </p>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Block Corridor */}
        <button
          onClick={() => onChange('corridorBlocked')}
          className={`p-3.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between cursor-pointer ${
            state.corridorBlocked
              ? 'bg-red-950/40 border-red-500/50 shadow-md shadow-red-950/20'
              : 'bg-command-950 hover:bg-command-800/80 border-command-border text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Ban className={`w-4 h-4 ${state.corridorBlocked ? 'text-red-400' : 'text-slate-400'}`} />
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                state.corridorBlocked
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-command-800 text-slate-400 border-command-700'
              }`}
            >
              {state.corridorBlocked ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
          <div>
            <div className={`text-xs font-bold ${state.corridorBlocked ? 'text-red-300' : 'text-slate-200'}`}>
              Block Corridor B
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Fire barrier isolates East Lab
            </div>
          </div>
        </button>

        {/* Disable Exit */}
        <button
          onClick={() => onChange('exitDisabled')}
          className={`p-3.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between cursor-pointer ${
            state.exitDisabled
              ? 'bg-red-950/40 border-red-500/50 shadow-md shadow-red-950/20'
              : 'bg-command-950 hover:bg-command-800/80 border-command-border text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <DoorClosed className={`w-4 h-4 ${state.exitDisabled ? 'text-red-400' : 'text-slate-400'}`} />
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                state.exitDisabled
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-command-800 text-slate-400 border-command-700'
              }`}
            >
              {state.exitDisabled ? 'DISABLED' : 'READY'}
            </span>
          </div>
          <div>
            <div className={`text-xs font-bold ${state.exitDisabled ? 'text-red-300' : 'text-slate-200'}`}>
              Disable Exit B (North)
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Perimeter gate lock triggered
            </div>
          </div>
        </button>

        {/* Increase Congestion */}
        <button
          onClick={() => onChange('congestionIncreased')}
          className={`p-3.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between cursor-pointer ${
            state.congestionIncreased
              ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-950/20'
              : 'bg-command-950 hover:bg-command-800/80 border-command-border text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Users className={`w-4 h-4 ${state.congestionIncreased ? 'text-amber-400' : 'text-slate-400'}`} />
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                state.congestionIncreased
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-command-800 text-slate-400 border-command-700'
              }`}
            >
              {state.congestionIncreased ? 'SURGE' : 'NORMAL'}
            </span>
          </div>
          <div>
            <div className={`text-xs font-bold ${state.congestionIncreased ? 'text-amber-300' : 'text-slate-200'}`}>
              Surge Congestion
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Main Hall density +200%
            </div>
          </div>
        </button>

        {/* Multiple Blockages */}
        <button
          onClick={() => onChange('multipleBlockages')}
          className={`p-3.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between cursor-pointer ${
            state.multipleBlockages
              ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-950/20'
              : 'bg-command-950 hover:bg-command-800/80 border-command-border text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Layers className={`w-4 h-4 ${state.multipleBlockages ? 'text-purple-400' : 'text-slate-400'}`} />
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                state.multipleBlockages
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-command-800 text-slate-400 border-command-700'
              }`}
            >
              {state.multipleBlockages ? 'COMPOUND' : 'OFF'}
            </span>
          </div>
          <div>
            <div className={`text-xs font-bold ${state.multipleBlockages ? 'text-purple-300' : 'text-slate-200'}`}>
              Multiple Blockages
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Corridor A + Main Hall cut
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
