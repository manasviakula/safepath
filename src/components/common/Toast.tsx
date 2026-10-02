import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useEmergency();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          danger: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
        }[toast.type];

        const borderStyles = {
          danger: 'border-red-500/40 bg-red-950/80 text-red-200 shadow-red-950/40',
          warning: 'border-amber-500/40 bg-amber-950/80 text-amber-200 shadow-amber-950/40',
          success: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200 shadow-emerald-950/40',
          info: 'border-cyan-500/40 bg-slate-900/95 text-cyan-200 shadow-cyan-950/30',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderStyles}`}
          >
            {icons}
            <div className="text-xs font-mono leading-relaxed flex-1">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
