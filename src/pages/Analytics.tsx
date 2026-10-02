import React from 'react';
import { AnalyticsSummaryCards } from '../components/analytics/AnalyticsCard';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';

export const Analytics: React.FC = () => {
  const { addToast } = useEmergency();

  const handleExport = () => {
    addToast('Evacuation telemetry & route log report exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-mono font-bold uppercase tracking-wider text-white">
              Egress Telemetry & Graph Performance Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Statistical throughput, reroute latencies, exit capacity ratios and hazard distributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg bg-command-900 hover:bg-command-800 text-slate-200 hover:text-white border border-command-border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <AnalyticsSummaryCards />

      {/* 4 Recharts Visualizations */}
      <AnalyticsCharts />
    </div>
  );
};
