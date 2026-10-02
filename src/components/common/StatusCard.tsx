import React from 'react';

interface StatusCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'operational' | 'danger' | 'warning' | 'info' | 'neutral';
  icon?: React.ReactNode;
  pulse?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  label,
  value,
  subtext,
  variant = 'neutral',
  icon,
  pulse = false,
}) => {
  const accentBorder = {
    operational: 'border-emerald-500/30 hover:border-emerald-500/50',
    danger: 'border-red-500/30 hover:border-red-500/50',
    warning: 'border-amber-500/30 hover:border-amber-500/50',
    info: 'border-cyan-500/30 hover:border-cyan-500/50',
    neutral: 'border-slate-800 hover:border-slate-700',
  }[variant];

  const valueColor = {
    operational: 'text-emerald-400',
    danger: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-cyan-400',
    neutral: 'text-slate-100',
  }[variant];

  const glowColor = {
    operational: 'shadow-emerald-950/20',
    danger: 'shadow-red-950/20',
    warning: 'shadow-amber-950/20',
    info: 'shadow-cyan-950/20',
    neutral: 'shadow-black/40',
  }[variant];

  return (
    <div
      className={`relative overflow-hidden bg-command-900/90 backdrop-blur-md rounded-xl border p-4.5 transition-all duration-200 shadow-lg ${glowColor} ${accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[11px] font-mono font-medium tracking-wider text-slate-400 uppercase">
          {label}
        </span>
        {icon && <div className="text-slate-400 p-1 rounded-md bg-command-800/60">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2.5">
        {pulse && (
          <span className="relative flex h-2.5 w-2.5 self-center">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                variant === 'danger'
                  ? 'bg-red-400'
                  : variant === 'operational'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                variant === 'danger'
                  ? 'bg-red-500'
                  : variant === 'operational'
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
          </span>
        )}
        <div className={`text-2xl font-bold tracking-tight font-mono ${valueColor}`}>
          {value}
        </div>
      </div>

      {subtext && (
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
          {subtext}
        </div>
      )}
    </div>
  );
};
