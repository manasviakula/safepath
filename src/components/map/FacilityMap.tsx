import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  LogOut,
  Flame,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Navigation,
  Ban,
  CheckCircle2,
  AlertOctagon,
  Loader2,
  X,
  Footprints,
} from 'lucide-react';

interface FacilityMapProps {
  size?: 'normal' | 'large';
  interactive?: boolean;
  highlightRouteOnly?: boolean;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  size = 'normal',
  interactive = true,
}) => {
  const {
    nodes,
    edges,
    blockedEdgeIds,
    activeRoute,
    startLocation,
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    blockEdge,
    restoreEdge,
    setPathStatus,
    rerouteState,
  } = useEmergency();

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const activeEdgeIds = new Set(activeRoute?.edgeIds || []);
  const activeNodeIds = new Set(activeRoute?.path || []);

  const heightClass = size === 'large' ? 'h-[580px] lg:h-[680px]' : 'h-[440px] lg:h-[500px]';

  const selectedEdge = edges.find(e => e.id === selectedEdgeId);
  const selectedEdgeIsBlocked = selectedEdgeId
    ? blockedEdgeIds.has(selectedEdgeId) || selectedEdge?.status === 'blocked'
    : false;

  const selectedEdgeFromNode = selectedEdge ? nodeMap.get(selectedEdge.from) : undefined;
  const selectedEdgeToNode = selectedEdge ? nodeMap.get(selectedEdge.to) : undefined;
  const selectedEdgeLabel = selectedEdge
    ? `${selectedEdgeFromNode?.name || selectedEdge.from} ↔ ${selectedEdgeToNode?.name || selectedEdge.to}`
    : null;

  return (
    <div className={`relative w-full ${heightClass} bg-command-950 rounded-xl border border-command-border overflow-hidden select-none shadow-2xl`}>
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Floor grid pattern */}
          <pattern id="floor-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeOpacity="0.4" />
          </pattern>

          {/* Route Glow Filter */}
          <filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Hazard Glow Filter */}
          <filter id="hazard-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="1000" height="600" fill="#070a12" />
        <rect width="1000" height="600" fill="url(#floor-grid)" />

        {/* Architectural Building Outer Boundary */}
        <path
          d="M 50 40 L 950 40 L 950 540 L 50 540 Z"
          fill="#0c1322"
          fillOpacity="0.75"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeDasharray="4,2"
        />

        {/* Architectural Rooms Floorprints (Visual blueprints) */}
        {/* Room 101 */}
        <g opacity="0.85">
          <rect x="150" y="110" width="160" height="150" rx="8" fill="#111c33" stroke="#253556" strokeWidth="1.5" />
          <text x="165" y="135" fill="#64748b" fontSize="11" fontFamily="monospace" fontWeight="600">ZONE-W1</text>
          <text x="165" y="152" fill="#94a3b8" fontSize="12" fontWeight="700">ROOM 101</text>
        </g>

        {/* Corridor A Transit Zone */}
        <g opacity="0.85">
          <rect x="340" y="140" width="100" height="160" rx="8" fill="#0e172a" stroke="#1e293b" strokeWidth="1.5" />
          <text x="350" y="160" fill="#64748b" fontSize="10" fontFamily="monospace">TRANSIT</text>
          <text x="350" y="175" fill="#94a3b8" fontSize="11" fontWeight="600">CORR A</text>
        </g>

        {/* Main Hall Atrium */}
        <g opacity="0.85">
          <rect x="460" y="210" width="160" height="200" rx="10" fill="#13203c" stroke="#2c3e66" strokeWidth="1.5" />
          <text x="475" y="235" fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="600">CENTRAL HUB</text>
          <text x="475" y="255" fill="#cbd5e1" fontSize="14" fontWeight="700">MAIN HALL</text>
          <text x="475" y="272" fill="#64748b" fontSize="10" fontFamily="monospace">Cap: 120 pax</text>
        </g>

        {/* Corridor B Zone */}
        <g opacity="0.85">
          <rect x="650" y="160" width="140" height="160" rx="8" fill="#0e172a" stroke="#1e293b" strokeWidth="1.5" />
          <text x="662" y="182" fill="#64748b" fontSize="10" fontFamily="monospace">TRANSIT</text>
          <text x="662" y="198" fill="#94a3b8" fontSize="11" fontWeight="600">CORR B</text>
        </g>

        {/* Laboratory Zone */}
        <g opacity="0.85">
          <rect x="770" y="100" width="140" height="150" rx="8" fill="#121e36" stroke="#253556" strokeWidth="1.5" />
          <text x="785" y="125" fill="#64748b" fontSize="10" fontFamily="monospace">RESEARCH</text>
          <text x="785" y="142" fill="#94a3b8" fontSize="12" fontWeight="700">LABORATORY</text>
        </g>

        {/* Staircase A Zone */}
        <g opacity="0.85">
          <rect x="650" y="360" width="120" height="130" rx="8" fill="#101a2f" stroke="#20304f" strokeWidth="1.5" />
          <text x="662" y="385" fill="#64748b" fontSize="10" fontFamily="monospace">EGRESS</text>
          <text x="662" y="402" fill="#94a3b8" fontSize="12" fontWeight="600">STAIRCASE A</text>
          {/* Stair step lines */}
          <line x1="662" y1="415" x2="750" y2="415" stroke="#334155" strokeWidth="1" />
          <line x1="662" y1="425" x2="750" y2="425" stroke="#334155" strokeWidth="1" />
          <line x1="662" y1="435" x2="750" y2="435" stroke="#334155" strokeWidth="1" />
          <line x1="662" y1="445" x2="750" y2="445" stroke="#334155" strokeWidth="1" />
        </g>

        {/* Exit Gate Blueprint Portals */}
        {/* Exit A (West) */}
        <rect x="70" y="150" width="60" height="80" rx="6" fill="#064e3b" fillOpacity="0.4" stroke="#10b981" strokeWidth="1.5" />
        {/* Exit B (North) */}
        <rect x="500" y="50" width="80" height="60" rx="6" fill="#064e3b" fillOpacity="0.4" stroke="#10b981" strokeWidth="1.5" />
        {/* Exit C (East) */}
        <rect x="850" y="410" width="80" height="70" rx="6" fill="#064e3b" fillOpacity="0.4" stroke="#10b981" strokeWidth="1.5" />

        {/* ----------------- PATH EDGES LAYER ----------------- */}
        {edges.map(edge => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const isBlocked = blockedEdgeIds.has(edge.id) || edge.status === 'blocked';
          const isWarning = edge.status === 'warning' && !isBlocked;
          const isActive = activeEdgeIds.has(edge.id);
          const isSelected = selectedEdgeId === edge.id;

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;

          return (
            <g
              key={edge.id}
              className={`${interactive ? 'cursor-pointer' : ''} transition-all duration-200`}
              onClick={() => {
                if (interactive) {
                  setSelectedEdgeId(edge.id);
                  setSelectedNodeId(null);
                }
              }}
            >
              {/* Invisible thick hover target for easier clicking */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="transparent"
                strokeWidth="28"
              />

              {/* Selection Halo */}
              {isSelected && (
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#38bdf8"
                  strokeWidth="8"
                  strokeOpacity="0.35"
                />
              )}

              {/* Base Path Line */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={
                  isBlocked
                    ? '#ef4444'
                    : isWarning
                    ? '#f59e0b'
                    : isSelected
                    ? '#38bdf8'
                    : '#10b981'
                }
                strokeWidth={isBlocked ? '3.5' : isSelected ? '3.5' : '2.5'}
                strokeDasharray={isBlocked ? '6,4' : isWarning ? '5,3' : 'none'}
                strokeOpacity={isBlocked ? 0.95 : isWarning ? 0.85 : 0.65}
              />

              {/* Active Route Highlight with Pulsing / Moving Dash */}
              {isActive && !isBlocked && (
                <>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#38bdf8"
                    strokeWidth="5.5"
                    filter="url(#route-glow)"
                    strokeOpacity="0.9"
                  />
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="8,6"
                    className="animate-dash"
                  />
                </>
              )}

              {/* Blocked Path Hazard Warning Marker */}
              {isBlocked && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <circle r="13" fill="#450a0a" stroke="#ef4444" strokeWidth="2" filter="url(#hazard-glow)" />
                  <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}

              {/* Warning Path Indicator Marker */}
              {isWarning && !isBlocked && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <circle r="10" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle r="3" fill="#f59e0b" />
                </g>
              )}

              {/* Distance Label Badge (if not blocked marker collision) */}
              {!isBlocked && !isWarning && (
                <g transform={`translate(${midX}, ${midY - 10})`}>
                  <rect
                    x="-16"
                    y="-8"
                    width="32"
                    height="15"
                    rx="3"
                    fill="#0b1120"
                    stroke={isSelected ? '#38bdf8' : '#1e293b'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {edge.label || `${edge.weight}m`}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ----------------- NODES LAYER ----------------- */}
        {nodes.map(node => {
          const isStart = startLocation === node.id;
          const isExit = node.type === 'exit';
          const isInRoute = activeNodeIds.has(node.id);
          const isSelected = selectedNodeId === node.id;
          const isTargetExit = activeRoute?.destination === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className={`${interactive ? 'cursor-pointer' : ''} group`}
              onClick={() => {
                if (interactive) {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                }
              }}
            >
              {/* Pulsing ring for Start Location */}
              {isStart && (
                <>
                  <circle r="26" fill="none" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" className="animate-ping" />
                  <circle r="22" fill="#0369a1" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
                </>
              )}

              {/* Target Exit Pulsing Ring */}
              {isExit && isTargetExit && (
                <>
                  <circle r="28" fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity="0.5" className="animate-ping" />
                  <circle r="24" fill="#065f46" fillOpacity="0.3" stroke="#34d399" strokeWidth="2" />
                </>
              )}

              {/* Selection Ring */}
              {isSelected && !isStart && (
                <circle r="22" fill="none" stroke="#f8fafc" strokeWidth="2" strokeDasharray="3,2" />
              )}

              {/* Node Body */}
              {isExit ? (
                // Exit Node Display
                <g>
                  <rect
                    x="-18"
                    y="-18"
                    width="36"
                    height="36"
                    rx="8"
                    fill={isTargetExit ? '#047857' : '#065f46'}
                    stroke={isTargetExit ? '#34d399' : '#10b981'}
                    strokeWidth={isTargetExit ? '3' : '2'}
                    filter="url(#route-glow)"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    EXIT
                  </text>
                  <text
                    x="0"
                    y="32"
                    textAnchor="middle"
                    fill={isTargetExit ? '#34d399' : '#a7f3d0'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {node.name}
                  </text>
                </g>
              ) : (
                // Internal Node Display
                <g>
                  <circle
                    r="15"
                    fill={
                      isStart
                        ? '#0284c7'
                        : isInRoute
                        ? '#0f766e'
                        : '#1e293b'
                    }
                    stroke={
                      isStart
                        ? '#38bdf8'
                        : isInRoute
                        ? '#2dd4bf'
                        : '#475569'
                    }
                    strokeWidth={isInRoute || isStart ? '2.5' : '1.5'}
                  />

                  {/* Inner Icon or ID */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isStart ? '#ffffff' : isInRoute ? '#e0f2fe' : '#cbd5e1'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {node.id === 'R101' ? '101' : node.id === 'LAB' ? 'LAB' : node.id.replace('CORR_', 'C').replace('MAIN_HALL', 'MH').replace('STAIRS_A', 'ST')}
                  </text>

                  {/* Node Label Below */}
                  <text
                    x="0"
                    y="27"
                    textAnchor="middle"
                    fill={isStart ? '#38bdf8' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {node.name}
                  </text>
                </g>
              )}

              {/* Start Badge Marker */}
              {isStart && (
                <g transform="translate(0, -26)">
                  <rect x="-24" y="-12" width="48" height="15" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                  <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="800">
                    START
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Status / Info Badge in Map corner */}
      <div className="absolute top-3 left-3 bg-command-900/90 backdrop-blur-md rounded-lg border border-command-border px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
        {rerouteState === 'blocked_detected' ? (
          <span className="text-red-400 font-bold animate-pulse flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            ACTIVE ROUTE BLOCKED
          </span>
        ) : rerouteState === 'recalculating' ? (
          <span className="text-amber-400 font-bold animate-pulse flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            RECALCULATING EVACUATION ROUTE…
          </span>
        ) : rerouteState === 'rerouted' ? (
          <span className="text-cyan-300 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            ALTERNATIVE ROUTE FOUND ({activeRoute?.destinationName} • {activeRoute?.distance}m)
          </span>
        ) : rerouteState === 'no_route' || activeRoute?.status === 'NO ROUTE FOUND' ? (
          <span className="text-red-400 font-bold flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            ALL REACHABLE ROUTES BLOCKED
          </span>
        ) : (
          <span className="text-slate-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            FLOOR 1 • <span className="text-emerald-400 font-semibold">EGRESS READY ({activeRoute?.distance}m)</span>
          </span>
        )}
      </div>

      {/* Interactive Path Inspector Card (Requirement 2 & 9) */}
      {selectedEdge && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 bg-command-900/95 backdrop-blur-md rounded-xl border border-cyan-500/40 p-3 shadow-2xl font-mono text-xs animate-fadeIn">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-command-border">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${selectedEdgeIsBlocked ? 'bg-red-400 animate-pulse' : selectedEdge.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="font-bold text-white text-xs">
                {selectedEdgeLabel}
              </span>
            </div>
            <button
              onClick={() => setSelectedEdgeId(null)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-command-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
            <div className="p-1.5 rounded bg-command-950 border border-command-border flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  selectedEdgeIsBlocked
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : selectedEdge.status === 'warning'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {selectedEdgeIsBlocked ? 'BLOCKED' : selectedEdge.status === 'warning' ? 'WARNING' : 'AVAILABLE'}
              </span>
            </div>
            <div className="p-1.5 rounded bg-command-950 border border-command-border flex items-center justify-between">
              <span className="text-slate-400">Distance:</span>
              <span className="text-slate-200 font-bold">{selectedEdge.weight} meters</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {selectedEdgeIsBlocked ? (
              <button
                onClick={() => restoreEdge(selectedEdge.id)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Restore Path</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => blockEdge(selectedEdge.id)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Block Path</span>
                </button>
                <button
                  onClick={() => setPathStatus(selectedEdge.id, selectedEdge.status === 'warning' ? 'available' : 'warning')}
                  className="py-1.5 px-2.5 rounded-lg bg-command-950 hover:bg-command-800 text-amber-400 border border-amber-500/40 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-xs"
                  title="Toggle Warning Penalty"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{selectedEdge.status === 'warning' ? 'Clear' : 'Warn'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
