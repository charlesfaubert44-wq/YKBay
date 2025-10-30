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
      bg: 'bg-forest-green/90',
      border: 'border-forest-green',
      iconColor: 'text-green-300',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-safety-red/90',
      border: 'border-safety-red',
      iconColor: 'text-red-300',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-safety-orange/90',
      border: 'border-safety-orange',
      iconColor: 'text-orange-300',
    },
    info: {
      icon: Info,
      bg: 'bg-aurora-blue/90',
      border: 'border-aurora-blue',
      iconColor: 'text-blue-300',
    },
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 ${config.bg} ${config.border} border-l-4 backdrop-blur-md rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md animate-slideInRight`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className="flex-1 text-ice-white font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 text-ice-white/70 hover:text-ice-white hover:bg-ice-white/10 rounded transition-colors duration-200"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
