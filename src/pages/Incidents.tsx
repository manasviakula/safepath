import React from 'react';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { StatusCard } from '../components/common/StatusCard';
import { useEmergency } from '../context/EmergencyContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export const Incidents: React.FC = () => {
  const { incidents } = useEmergency();

  const totalCount = incidents.length;
  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status === 'Active').length;
  const activeCount = incidents.filter(i => i.status === 'Active').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* KPI Cards for Incident Ops */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard
          label="Total Incidents Logged"
          value={totalCount}
          subtext="Telemetry event records"
          variant="neutral"
          icon={<Activity className="w-4 h-4 text-slate-400" />}
        />

        <StatusCard
          label="Critical Severity Hazards"
          value={criticalCount}
          subtext="Requiring immediate interdiction"
          variant="danger"
          pulse={criticalCount > 0}
          icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
        />

        <StatusCard
          label="Active Hazards"
          value={activeCount}
          subtext="Corridor path impediments"
          variant="warning"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />

        <StatusCard
          label="Resolved / De-escalated"
          value={resolvedCount}
          subtext="Restored to operational safe state"
          variant="operational"
          icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      {/* Filterable Incident Table */}
      <IncidentTable />
    </div>
  );
};
