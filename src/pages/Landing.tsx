import React from 'react';
import { NavPage } from '../components/layout/Sidebar';
import {
  ShieldAlert,
  ArrowRight,
  GitBranch,
  PlayCircle,
  Network,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';

interface LandingProps {
  onNavigate: (page: NavPage) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const mappingRules = [
    { physical: 'Physical Building Structure', graph: 'Weighted Graph G = (V, E)', icon: Layers },
    { physical: 'Room / Office / Chamber', graph: 'Graph Node / Vertex (V)', icon: Zap },
    { physical: 'Corridor / Pathway / Hallway', graph: 'Graph Edge (E)', icon: Network },
    { physical: 'Physical Distance & Walking Cost', graph: 'Edge Weight (w)', icon: GitBranch },
    { physical: 'Blocked Path / Fire Barrier', graph: 'Unavailable / Removed Edge (w = ∞)', icon: Lock },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-command-900 via-command-950 to-command-950 border border-command-border p-8 md:p-14 text-center shadow-2xl">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Shield / Path Logo Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs mb-6 shadow-md shadow-cyan-950/40">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold tracking-wider">SAFEPATH INTELLIGENCE SUITE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Headline & Tagline */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto font-mono uppercase leading-tight">
          "Every Second Matters.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
            Every Route Counts.
          </span>"
        </h1>

        {/* Supporting Text */}
        <p className="mt-5 text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          SafePath dynamically identifies efficient evacuation routes and helps reroute people when emergency paths become unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('command-center')}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider transition-all duration-150 flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-950/50 cursor-pointer"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('live-map')}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-command-900 hover:bg-command-850 text-slate-200 hover:text-white border border-command-border hover:border-slate-600 font-mono text-xs font-semibold tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Live Map</span>
          </button>
        </div>

        {/* Live System Operational Specs */}
        <div className="mt-10 pt-6 border-t border-command-border/60 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Dijkstra Shortest Path
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Dynamic Hazard Re-indexing
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Sub-millisecond Recalculation
          </span>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold mb-1">
            CORE CAPABILITIES
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white">
            Designed for Critical Infrastructure Safety
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Dynamic Routing */}
          <div
            onClick={() => onNavigate('command-center')}
            className="p-6 rounded-xl bg-command-900/90 border border-command-border hover:border-cyan-500/40 transition-all duration-200 cursor-pointer group shadow-xl"
          >
            <div className="p-3 w-fit rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 mb-4 group-hover:bg-cyan-900/50">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-mono font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              Dynamic Routing
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              "Automatically recalculate an evacuation route when a path becomes unavailable."
            </p>
          </div>

          {/* Card 2: Emergency Simulation */}
          <div
            onClick={() => onNavigate('simulation')}
            className="p-6 rounded-xl bg-command-900/90 border border-command-border hover:border-emerald-500/40 transition-all duration-200 cursor-pointer group shadow-xl"
          >
            <div className="p-3 w-fit rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 mb-4 group-hover:bg-emerald-900/50">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-mono font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              Emergency Simulation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              "Test evacuation scenarios before they happen."
            </p>
          </div>

          {/* Card 3: Graph-Based Intelligence */}
          <div
            onClick={() => onNavigate('what-if')}
            className="p-6 rounded-xl bg-command-900/90 border border-command-border hover:border-amber-500/40 transition-all duration-200 cursor-pointer group shadow-xl"
          >
            <div className="p-3 w-fit rounded-lg bg-amber-950/70 border border-amber-500/30 text-amber-400 mb-4 group-hover:bg-amber-900/50">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-base font-mono font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
              Graph-Based Intelligence
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              "Model buildings as weighted graphs for efficient route calculation."
            </p>
          </div>
        </div>
      </section>

      {/* Building -> Graph Conceptual Mapping Section */}
      <section className="bg-command-900/90 rounded-2xl border border-command-border p-6 md:p-8 shadow-xl">
        <div className="mb-6">
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold mb-1">
            ALGORITHMIC ABSTRACTION
          </div>
          <h2 className="text-lg md:text-xl font-bold font-mono text-white">
            Physical Space Translated to Weighted Graph Representation
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            SafePath abstracts architectural floor plans into a deterministic mathematical graph, enabling instant shortest-path computations under dynamic constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {mappingRules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-command-950 border border-command-border/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-mono text-slate-400">Rule 0{idx + 1}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mb-1">
                    {rule.physical}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-command-border/60">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Graph Equivalent</div>
                  <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                    → {rule.graph}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
