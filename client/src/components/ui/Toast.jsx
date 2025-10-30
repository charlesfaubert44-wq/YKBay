import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 5000, onClose, id }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, id]);

  const types = {
    success: {
      icon: CheckCircle,
      bg: 'bg-safety-success/90',
      border: 'border-safety-success',
      iconColor: 'text-safety-success',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-safety-critical/90',
      border: 'border-safety-critical',
      iconColor: 'text-safety-critical',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-safety-warning/90',
      border: 'border-safety-warning',
      iconColor: 'text-safety-warning',
    },
    info: {
      icon: Info,
      bg: 'bg-aurora-blue/90',
      border: 'border-aurora-blue',
      iconColor: 'text-aurora-blue',
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 ${config.bg} ${config.border} border-l-4 backdrop-blur-md rounded-button shadow-elevation-3 p-4 min-w-[320px] max-w-md animate-slideInRight`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className="flex-1 text-frost-white font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 text-frost-white/70 hover:text-frost-white hover:bg-frost-white/10 rounded transition-colors duration-200 touch-target"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
