import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { Incident, IncidentSeverity, IncidentStatus } from '../../types/incident';
import { Badge } from '../common/Badge';
import {
  AlertTriangle,
  Flame,
  Users,
  Search,
  CheckCircle,
  Clock,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

interface IncidentTableProps {
  onSelectPath?: (edgeId: string) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ onSelectPath }) => {
  const { incidents, updateIncidentStatus, toggleBlockEdge, blockedEdgeIds } = useEmergency();
  const [filter, setFilter] = useState<'All' | IncidentSeverity | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = incidents.filter(inc => {
    // Severity or Resolved filter
    if (filter === 'Resolved') {
      if (inc.status !== 'Resolved') return false;
    } else if (filter !== 'All') {
      if (inc.severity !== filter) return false;
    }

    // Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.affectedPath.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getIncidentIcon = (type: string) => {
    if (type.toLowerCase().includes('fire')) return <Flame className="w-3.5 h-3.5 text-red-400" />;
    if (type.toLowerCase().includes('congestion')) return <Users className="w-3.5 h-3.5 text-amber-400" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
  };

  return (
    <div className="bg-command-900/90 backdrop-blur-md rounded-xl border border-command-border shadow-xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-command-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Incident Management Console
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active structural hazards, sensor telemetry & egress interdictions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-command-950 p-1 rounded-lg border border-command-border">
          {(['All', 'Critical', 'High', 'Medium', 'Resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                filter === tab
                  ? 'bg-command-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-command-950/60 border-b border-command-border/60 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter by Incident ID, zone, hazard type, or affected path..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] font-mono text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-command-border bg-command-950 text-[11px] font-mono uppercase text-slate-400">
              <th className="py-3 px-4">Incident ID</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Hazard Type</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Affected Path</th>
              <th className="py-3 px-4">Detected</th>
              <th className="py-3 px-4 text-right">Intervention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-command-border/50 text-xs font-mono">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  No incidents matching the selected criteria.
                </td>
              </tr>
            ) : (
              filteredIncidents.map(inc => {
                const isBlocked = inc.affectedEdgeIds?.some(id => blockedEdgeIds.has(id));

                return (
                  <tr
                    key={inc.id}
                    className="hover:bg-command-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-white tracking-wider">
                      {inc.id}
                    </td>

                    <td className="py-3.5 px-4 text-slate-200">
                      {inc.location}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {getIncidentIcon(inc.type)}
                        <span>{inc.type}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          inc.severity === 'Critical'
                            ? 'critical'
                            : inc.severity === 'High'
                            ? 'high'
                            : 'medium'
                        }
                        size="sm"
                        pulse={inc.severity === 'Critical' && inc.status === 'Active'}
                      >
                        {inc.severity}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          inc.status === 'Active'
                            ? 'bg-red-500/10 text-red-300 border-red-500/20'
                            : inc.status === 'Monitoring'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        }`}
                      >
                        {inc.status === 'Active' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        ) : inc.status === 'Monitoring' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ) : (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        )}
                        {inc.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {inc.affectedPath}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {inc.timestamp}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Path Block Action */}
                        {inc.affectedEdgeIds && inc.affectedEdgeIds.length > 0 && (
                          <button
                            onClick={() => toggleBlockEdge(inc.affectedEdgeIds![0])}
                            className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                              isBlocked
                                ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                                : 'bg-red-950/60 hover:bg-red-900 text-red-300 border-red-800'
                            }`}
                          >
                            {isBlocked ? 'Restore Path' : 'Block Path'}
                          </button>
                        )}

                        {/* Status Toggles */}
                        {inc.status === 'Active' ? (
                          <button
                            onClick={() => updateIncidentStatus(inc.id, 'Resolved')}
                            className="px-2 py-1 rounded bg-command-800 hover:bg-command-700 text-slate-200 border border-command-700 text-[11px] transition-colors"
                          >
                            Resolve
                          </button>
                        ) : inc.status === 'Monitoring' ? (
                          <button
                            onClick={() => updateIncidentStatus(inc.id, 'Resolved')}
                            className="px-2 py-1 rounded bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-[11px] transition-colors"
                          >
                            Clear
                          </button>
                        ) : (
                          <button
                            onClick={() => updateIncidentStatus(inc.id, 'Active')}
                            className="px-2 py-1 rounded bg-command-950 hover:bg-command-800 text-slate-400 hover:text-slate-200 border border-command-border text-[11px] transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
