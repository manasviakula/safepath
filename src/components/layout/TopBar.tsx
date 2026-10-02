import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  Clock,
  Radio,
  X,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { NavPage } from './Sidebar';

interface TopBarProps {
  currentPage: NavPage;
  onOpenMobile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentPage,
  onOpenMobile,
}) => {
  const { systemStatus, incidents, resetGraph, addToast } = useEmergency();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<NavPage, { title: string; subtitle: string }> = {
    landing: {
      title: 'Platform Overview',
      subtitle: 'SafePath Emergency Egress Architecture & Capabilities',
    },
    'command-center': {
      title: 'Command Center',
      subtitle: 'Operational Egress Routing & Real-Time Graph Monitor',
    },
    'live-map': {
      title: 'Live Facility Map',
      subtitle: 'Dynamic Architectural Egress Plan & Corridor Control',
    },
    simulation: {
      title: 'Emergency Simulation',
      subtitle: 'Dynamic Evacuation Scenarios & Recalculation Drills',
    },
    'what-if': {
      title: 'What-If Scenario Modeling',
      subtitle: 'Contingency Impact Assessment & Exit Route Deltas',
    },
    incidents: {
      title: 'Incident Management',
      subtitle: 'Active Hazard Registry & Egress Path Interdiction',
    },
    analytics: {
      title: 'Analytics & Performance',
      subtitle: 'Evacuation Throughput, Latency & Exit Utilization Metrics',
    },
    'algorithm-visualizer': {
      title: 'Algorithm Visualizer',
      subtitle: 'Interactive Binary Min-Heap Dijkstra Graph Traversal Demo',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Facility Dimensions, Walking Velocity & Emergency Protocols',
    },
  };

  const activeIncidents = incidents.filter(i => i.status === 'Active');

  return (
    <header className="sticky top-0 z-30 h-18 bg-command-950/90 backdrop-blur-md border-b border-command-border px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-command-900 border border-command-border"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base lg:text-lg font-bold font-mono tracking-tight text-white uppercase">
              {titles[currentPage]?.title || 'Command Center'}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-command-800 text-slate-300 border border-command-700">
              SEC-OPS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono hidden md:block">
            {titles[currentPage]?.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Operational Status, Clock, Notifications, Settings */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Live Mission Clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-command-900/80 border border-command-border font-mono text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tracking-wider">{currentTime || '16:00:00'} UTC</span>
        </div>

        {/* Global Reset Action */}
        <button
          onClick={resetGraph}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-command-900/80 hover:bg-command-800 text-slate-300 hover:text-white border border-command-border text-xs font-mono transition-colors"
          title="Reset facility graph to default baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Graph</span>
        </button>

        {/* System Status Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs ${
            systemStatus === 'OPERATIONAL'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : systemStatus === 'DEGRADED'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                systemStatus === 'OPERATIONAL'
                  ? 'bg-emerald-400'
                  : systemStatus === 'DEGRADED'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                systemStatus === 'OPERATIONAL'
                  ? 'bg-emerald-500'
                  : systemStatus === 'DEGRADED'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            />
          </span>
          <span className="font-semibold tracking-wide">
            {systemStatus}
          </span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            className={`relative p-2 rounded-lg border transition-colors ${
              notificationsOpen
                ? 'bg-command-800 border-cyan-500/40 text-cyan-300'
                : 'bg-command-900/80 border-command-border text-slate-300 hover:text-white hover:bg-command-800'
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {activeIncidents.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white font-mono shadow-sm">
                {activeIncidents.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-command-900 border border-command-border shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-command-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    Emergency Alerts ({activeIncidents.length})
                  </span>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                {activeIncidents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-mono">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                    All sectors clear. No active hazard alerts.
                  </div>
                ) : (
                  activeIncidents.map(inc => (
                    <div
                      key={inc.id}
                      className="p-2.5 rounded-lg bg-command-950/80 border border-red-500/30 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-red-400 font-bold mb-1">
                        <span>{inc.id} • {inc.type}</span>
                        <span className="text-[10px] text-slate-400">{inc.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-snug">
                        {inc.description}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Path: {inc.affectedPath}</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          {inc.severity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Dispatcher Mode Indicator */}
        <div className="relative">
          <button
            onClick={() => setSettingsOpen(prev => !prev)}
            className={`p-2 rounded-lg border transition-colors ${
              settingsOpen
                ? 'bg-command-800 border-cyan-500/40 text-cyan-300'
                : 'bg-command-900/80 border-command-border text-slate-300 hover:text-white hover:bg-command-800'
            }`}
            title="Dispatch Settings"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Quick Settings Panel */}
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-command-900 border border-command-border shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-command-border mb-3">
                <span className="font-mono text-xs font-bold uppercase text-white">
                  Console Configuration
                </span>
                <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Routing Strategy:</span>
                  <span className="text-cyan-400 font-semibold">Min-Distance Dijkstra</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Walking Velocity:</span>
                  <span className="text-slate-400">1.25 m/s</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Auto-Reroute:</span>
                  <span className="text-emerald-400">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Facility Zone:</span>
                  <span className="text-slate-400">Main Complex (Floor 1)</span>
                </div>

                <div className="pt-2 border-t border-command-border">
                  <button
                    onClick={() => {
                      addToast('Audio broadcast beacon pinged to all zones.', 'info');
                      setSettingsOpen(false);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-command-800 hover:bg-command-750 text-slate-200 border border-command-700 text-center font-mono text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    Ping Emergency Beacons
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
