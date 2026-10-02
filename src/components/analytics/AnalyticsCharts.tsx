import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import {
  HOURLY_ROUTES_DATA,
  SUCCESS_VS_REROUTED_DATA,
  INCIDENT_FREQUENCY_DATA,
  EXIT_UTILIZATION_DATA,
} from '../../data/analytics';
import { Activity, GitMerge, AlertCircle, DoorOpen } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-command-950 border border-command-border p-3 rounded-lg shadow-2xl font-mono text-xs">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="flex items-center gap-2">
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart 1: Routes Calculated Over Time */}
      <div className="bg-command-900/90 rounded-xl border border-command-border p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Routes Calculated Over Time (Hourly)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-cyan-400 border border-command-border">
            Real-time Telemetry
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_ROUTES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rerouteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }}
              />
              <Area
                type="monotone"
                dataKey="routes"
                name="Total Routes"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#routeGrad)"
              />
              <Area
                type="monotone"
                dataKey="rerouted"
                name="Rerouted"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rerouteGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Successful vs Rerouted Journeys */}
      <div className="bg-command-900/90 rounded-xl border border-command-border p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
          <div className="flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Successful vs Rerouted by Facility Zone
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-emerald-400 border border-command-border">
            Zone Egress
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SUCCESS_VS_REROUTED_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="zone" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }} />
              <Bar dataKey="direct" name="Direct Primary Path" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rerouted" name="Dijkstra Recalculated" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Incident Frequency */}
      <div className="bg-command-900/90 rounded-xl border border-command-border p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Incident Frequency by Hazard Classification
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-red-400 border border-command-border">
            Telemetry Events
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={INCIDENT_FREQUENCY_DATA}
              margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis type="category" dataKey="type" stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Reported Incidents" radius={[0, 4, 4, 0]}>
                {INCIDENT_FREQUENCY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Exit Utilization */}
      <div className="bg-command-900/90 rounded-xl border border-command-border p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-command-border">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Exit Utilization & Dynamic Capacity Load
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-950 text-emerald-400 border border-command-border">
            Load Distribution
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EXIT_UTILIZATION_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="exit" stroke="#64748b" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }} />
              <Bar dataKey="capacity" name="Total Exit Capacity (pax)" fill="#334155" radius={[4, 4, 0, 0]} />
              <Bar dataKey="routedOccupants" name="Currently Routed Occupants" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
