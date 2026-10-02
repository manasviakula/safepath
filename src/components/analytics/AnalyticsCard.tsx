import React from 'react';
import { StatusCard } from '../common/StatusCard';
import {
  Navigation,
  CheckCircle2,
  GitBranch,
  Footprints,
  Ban,
  DoorOpen,
} from 'lucide-react';
import { ANALYTICS_METRICS } from '../../data/analytics';
import { useEmergency } from '../../context/EmergencyContext';

export const AnalyticsSummaryCards: React.FC = () => {
  const { blockedEdgeIds } = useEmergency();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <StatusCard
        label="Routes Calculated"
        value={ANALYTICS_METRICS.routesCalculated.toLocaleString()}
        subtext="+14% this hour"
        variant="info"
        icon={<Navigation className="w-4 h-4 text-cyan-400" />}
      />

      <StatusCard
        label="Successful Routes"
        value={ANALYTICS_METRICS.successfulRoutes.toLocaleString()}
        subtext="96.4% success rate"
        variant="operational"
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      />

      <StatusCard
        label="Routes Recalculated"
        value={ANALYTICS_METRICS.routesRecalculated}
        subtext="Dynamic rerouting"
        variant="warning"
        icon={<GitBranch className="w-4 h-4 text-amber-400" />}
      />

      <StatusCard
        label="Avg Route Distance"
        value={ANALYTICS_METRICS.averageRouteDistance}
        subtext="Optimal Dijkstra paths"
        variant="neutral"
        icon={<Footprints className="w-4 h-4 text-slate-400" />}
      />

      <StatusCard
        label="Blocked Paths"
        value={blockedEdgeIds.size}
        subtext="Hazard interdictions"
        variant={blockedEdgeIds.size > 0 ? 'danger' : 'neutral'}
        pulse={blockedEdgeIds.size > 0}
        icon={<Ban className="w-4 h-4 text-red-400" />}
      />

      <StatusCard
        label="Available Exits"
        value={`${ANALYTICS_METRICS.availableExitsCount} / ${ANALYTICS_METRICS.totalExits}`}
        subtext="Exit A, Exit B, Exit C"
        variant="operational"
        icon={<DoorOpen className="w-4 h-4 text-emerald-400" />}
      />
    </div>
  );
};
