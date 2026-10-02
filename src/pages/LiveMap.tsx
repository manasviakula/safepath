import React from 'react';
import { FacilityMap } from '../components/map/FacilityMap';
import { MapLegend } from '../components/map/MapLegend';
import { useEmergency } from '../context/EmergencyContext';
import {
  Ban,
  RotateCcw,
  CheckCircle2,
  Navigation,
  Activity,
  Layers,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

export const LiveMap: React.FC = () => {
  const {
    nodes,
    edges,
    blockedEdgeIds,
    selectedNodeId,
    selectedEdgeId,
    startLocation,
    setStartLocation,
    setSelectedNodeId,
    setSelectedEdgeId,
    toggleBlockEdge,
    blockEdge,
    restoreEdge,
    calculateRoute,
    resetGraph,
    incidents,
  } = useEmergency();

  const selectedEdge = edges.find(e => e.id === selectedEdgeId);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const isSelectedBlocked = selectedEdgeId ? blockedEdgeIds.has(selectedEdgeId) : false;

  // Find incident associated with selected path
  const relatedIncident = incidents.find(
    i => selectedEdgeId && i.affectedEdgeIds?.includes(selectedEdgeId)
  );

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-command-900/90 backdrop-blur-md rounded-xl border border-command-border p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Location selection dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Anchor Node:</span>
          </div>

          <select
            value={startLocation}
            onChange={e => {
              setStartLocation(e.target.value);
              setSelectedNodeId(e.target.value);
            }}
            className="bg-command-950 border border-command-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.id})
              </option>
            ))}
          </select>

          {/* Quick Show Route button */}
          <button
            onClick={() => calculateRoute()}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Show Route</span>
          </button>
        </div>

        {/* Right: Path Block, Restore, Reset Map */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Path Toggle Buttons for currently selected path */}
          {selectedEdgeId && (
            <>
              {isSelectedBlocked ? (
                <button
                  onClick={() => restoreEdge(selectedEdgeId)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Restore Path</span>
                </button>
              ) : (
                <button
                  onClick={() => blockEdge(selectedEdgeId)}
                  className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Block Path</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={resetGraph}
            className="px-3 py-1.5 rounded-lg bg-command-950 hover:bg-command-800 text-slate-300 hover:text-white border border-command-border font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Map</span>
          </button>
        </div>
      </div>

      {/* Main Area: Large Facility Map + Inspector Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Large SVG Facility Map (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-3">
          <FacilityMap size="large" interactive={true} />
          <MapLegend />
        </div>

        {/* Information Panel (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-command-900/90 rounded-xl border border-command-border p-4.5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Path Telemetry Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-slate-400 border border-command-border">
                Real-Time State
              </span>
            </div>

            {selectedEdge ? (
              <div className="space-y-3.5 text-xs font-mono">
                {/* Selected Path */}
                <div className="p-3 rounded-lg bg-command-950 border border-command-border">
                  <div className="text-[10px] text-slate-400 uppercase mb-1">
                    Selected Path ID
                  </div>
                  <div className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{selectedEdge.id}</span>
                    <span className="text-cyan-400">{selectedEdge.from} ↔ {selectedEdge.to}</span>
                  </div>
                </div>

                {/* Distance & Congestion */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-command-950 border border-command-border">
                    <div className="text-[10px] text-slate-400 uppercase mb-0.5">
                      Distance
                    </div>
                    <div className="text-base font-bold text-white">
                      {selectedEdge.weight} <span className="text-xs text-slate-400 font-normal">meters</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-command-950 border border-command-border">
                    <div className="text-[10px] text-slate-400 uppercase mb-0.5">
                      Congestion
                    </div>
                    <div className={`text-base font-bold capitalize ${
                      selectedEdge.congestion === 'high'
                        ? 'text-red-400'
                        : selectedEdge.congestion === 'medium'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {selectedEdge.congestion}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="p-3 rounded-lg bg-command-950 border border-command-border flex items-center justify-between">
                  <span className="text-slate-400">Path Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    isSelectedBlocked
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : selectedEdge.status === 'warning'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    {isSelectedBlocked ? 'BLOCKED' : selectedEdge.status.toUpperCase()}
                  </span>
                </div>

                {/* Associated Incident */}
                <div className="p-3 rounded-lg bg-command-950 border border-command-border">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Associated Incident
                  </div>
                  {relatedIncident ? (
                    <div>
                      <div className="text-xs font-bold text-red-400">
                        {relatedIncident.id} • {relatedIncident.type}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {relatedIncident.description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px]">
                      No active incident flagged on this corridor.
                    </div>
                  )}
                </div>

                {/* Interactive Action Button */}
                <button
                  onClick={() => toggleBlockEdge(selectedEdge.id)}
                  className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isSelectedBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isSelectedBlocked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unblock & Restore Corridor</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Trigger Emergency Path Block</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                Click any pathway or corridor on the map to inspect telemetry, toggle blockades, or view hazard reports.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
