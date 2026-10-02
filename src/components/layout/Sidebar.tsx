import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  MapPin,
  PlayCircle,
  GitBranch,
  AlertOctagon,
  BarChart3,
  Home,
  X,
  Radio,
  Cpu,
  Settings,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export type NavPage =
  | 'landing'
  | 'command-center'
  | 'live-map'
  | 'simulation'
  | 'what-if'
  | 'incidents'
  | 'analytics'
  | 'algorithm-visualizer'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { incidents, blockedEdgeIds } = useEmergency();
  const activeIncidentsCount = incidents.filter(i => i.status === 'Active').length;

  const navItems = [
    {
      id: 'command-center' as NavPage,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Central Operations Hub',
    },
    {
      id: 'live-map' as NavPage,
      label: 'Live Map',
      icon: MapPin,
      badge: blockedEdgeIds.size > 0 ? `${blockedEdgeIds.size} BLOCKED` : null,
      badgeVariant: 'warning',
      desc: 'Interactive Floor Egress',
    },
    {
      id: 'simulation' as NavPage,
      label: 'Simulation',
      icon: PlayCircle,
      badge: 'DRILL',
      badgeVariant: 'neutral',
      desc: 'Drill & Scenario Runner',
    },
    {
      id: 'what-if' as NavPage,
      label: 'What-If Scenarios',
      icon: GitBranch,
      badge: null,
      desc: 'Contingency Impact Builder',
    },
    {
      id: 'incidents' as NavPage,
      label: 'Incident Management',
      icon: AlertOctagon,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} ACTIVE` : null,
      badgeVariant: 'danger',
      desc: 'Hazard Dispatch Table',
    },
    {
      id: 'analytics' as NavPage,
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
      desc: 'Egress Metrics & Insights',
    },
    {
      id: 'algorithm-visualizer' as NavPage,
      label: 'Algorithm Visualizer',
      icon: Cpu,
      badge: 'DIJKSTRA',
      badgeVariant: 'info',
      desc: 'Min-Heap Traversal Demo',
    },
    {
      id: 'settings' as NavPage,
      label: 'Settings',
      icon: Settings,
      badge: null,
      desc: 'Facility & Velocity Parameters',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-command-950 border-r border-command-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-18 px-5 border-b border-command-border flex items-center justify-between">
          <div
            onClick={() => {
              onNavigate('landing');
              onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Logo Icon */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 group-hover:bg-cyan-900/60 transition-all shadow-md shadow-cyan-950/40">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-command-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-wider text-white font-mono uppercase">
                  SAFE<span className="text-cyan-400">PATH</span>
                </span>
                <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-command-800 text-slate-400 border border-command-700">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">
                Emergency Route Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white lg:hidden rounded-md hover:bg-command-900"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Active Banner */}
        <div className="px-4 py-2.5 bg-command-900/80 border-b border-command-border/60 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-semibold tracking-wider">GRAPH ENGINE ONLINE</span>
          </div>
          <span className="text-slate-500 text-[10px]">FACILITY #1</span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            Operations Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/30'
                    : 'text-slate-300 hover:bg-command-900 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <div>
                    <div className="font-medium">{item.label}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border ${
                      item.badgeVariant === 'danger'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : item.badgeVariant === 'warning'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-command-800 text-slate-400 border-command-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            Platform
          </div>

          <button
            onClick={() => {
              onNavigate('landing');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all group text-left ${
              currentPage === 'landing'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-300 hover:bg-command-900 hover:text-white border border-transparent'
            }`}
          >
            <Home className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span className="font-medium">Overview Landing</span>
          </button>
        </nav>

        {/* Footer Mission Statement & Tagline */}
        <div className="p-4 border-t border-command-border bg-command-950/90">
          <div className="p-3 rounded-lg bg-command-900/60 border border-command-border/80">
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
              Mission Mandate
            </div>
            <p className="text-[11px] text-slate-300 leading-snug italic font-serif">
              "Every Second Matters. Every Route Counts."
            </p>
            <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Graph: 9 Nodes / 11 Edges</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
