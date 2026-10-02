import React from 'react';
import { StatusCard } from '../components/common/StatusCard';
import { FacilityMap } from '../components/map/FacilityMap';
import { MapLegend } from '../components/map/MapLegend';
import { RouteControl } from '../components/command/RouteControl';
import { RouteResultCard } from '../components/command/RouteResultCard';
import { RouteComparisonCard } from '../components/command/RouteComparisonCard';
import { RouteHistoryCard } from '../components/command/RouteHistoryCard';
import { AlgorithmTrace } from '../components/command/AlgorithmTrace';
import { useEmergency } from '../context/EmergencyContext';
import {
  Activity,
  AlertTriangle,
  DoorOpen,
  Route,
  Radio,
  Ban,
} from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const { systemStatus, incidents, blockedEdgeIds, nodes, rerouteState, activeRoute } = useEmergency();
  const activeIncidentsCount = incidents.filter(i => i.status === 'Active').length;
  const availableExitsCount = nodes.filter(n => n.type === 'exit' && n.available).length;

  const evacuationStatusLabel =
    rerouteState === 'rerouted'
      ? 'REROUTED'
      : rerouteState === 'blocked_detected'
      ? 'ALERT'
      : rerouteState === 'no_route'
      ? 'NO EXIT'
      : 'ACTIVE';

  const evacuationStatusVariant =
    rerouteState === 'rerouted'
      ? 'info'
      : rerouteState === 'blocked_detected' || rerouteState === 'no_route'
      ? 'danger'
      : 'warning';

  return (
    <div className="space-y-5">
      {/* Top 5 Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatusCard
          label="SYSTEM STATUS"
          value={systemStatus}
          subtext="Sensor grid & graph online"
          variant={systemStatus === 'EMERGENCY' ? 'danger' : systemStatus === 'DEGRADED' ? 'warning' : 'operational'}
          pulse={systemStatus !== 'OPERATIONAL'}
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
        />

        <StatusCard
          label="ACTIVE INCIDENTS"
          value={activeIncidentsCount}
          subtext={`${blockedEdgeIds.size} corridor barrier(s)`}
          variant={activeIncidentsCount > 0 ? 'danger' : 'operational'}
          pulse={activeIncidentsCount > 0}
          icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
        />

        <StatusCard
          label="AVAILABLE EXITS"
          value={`${availableExitsCount} / 3`}
          subtext="Egress gates operational"
          variant="operational"
          icon={<DoorOpen className="w-4 h-4 text-emerald-400" />}
        />

        <StatusCard
          label="BLOCKED PATHS"
          value={blockedEdgeIds.size}
          subtext="Excluded from Dijkstra"
          variant={blockedEdgeIds.size > 0 ? 'warning' : 'operational'}
          icon={<Ban className="w-4 h-4 text-amber-400" />}
        />

        <StatusCard
          label="CURRENT EVACUATION"
          value={evacuationStatusLabel}
          subtext={activeRoute && activeRoute.status !== 'NO ROUTE FOUND' ? `Egress: ${activeRoute.destinationName}` : 'No path available'}
          variant={evacuationStatusVariant}
          pulse={true}
          icon={<Radio className="w-4 h-4 text-amber-400 animate-pulse" />}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Interactive Facility Map (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Facility Digital Twin (Floor Plan View)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Interactive Corridors & Real-Time Rerouting
            </span>
          </div>

          {/* SVG Map */}
          <FacilityMap size="normal" interactive={true} />

          {/* Map Legend */}
          <MapLegend />
        </div>

        {/* RIGHT COLUMN: Route Controls, Comparison, Results, Trace, History (5 cols on lg, 4 on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Route Controls */}
          <RouteControl />

          {/* Route Comparison Card (Shows Before/After when rerouting occurs) */}
          <RouteComparisonCard />

          {/* Route Result Card */}
          <RouteResultCard />

          {/* Algorithm Trace Panel */}
          <AlgorithmTrace />

          {/* Route History Log */}
          <RouteHistoryCard />
        </div>
      </div>
    </div>
  );
};
