import { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, AlertCircle } from 'lucide-react';
import hazardAlert from '../services/hazardAlert';

const HazardAlertBanner = () => {
  const [activeAlert, setActiveAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen to hazard alert events
    const handleAlertEvent = (event) => {
      switch (event.type) {
        case 'HAZARD_ALERT':
          showAlert(event);
          break;

        case 'SERVICE_STARTED':
          console.log('Hazard alert service started');
          break;

        case 'SERVICE_STOPPED':
          console.log('Hazard alert service stopped');
          setActiveAlert(null);
          setIsVisible(false);
          break;

        default:
          break;
      }
    };

    hazardAlert.addEventListener(handleAlertEvent);

    return () => {
      hazardAlert.removeEventListener(handleAlertEvent);
    };
  }, []);

  const showAlert = (alertData) => {
    setActiveAlert(alertData);
    setIsVisible(true);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      dismissAlert();
    }, 10000);
  };

  const dismissAlert = () => {
    setIsVisible(false);
    setTimeout(() => {
      setActiveAlert(null);
    }, 300); // Wait for animation
  };

  const handleMarkPassed = async () => {
    if (activeAlert) {
      await hazardAlert.markHazardPassed(activeAlert.hazard.id);
      dismissAlert();
    }
  };

  const handleConfirmHazard = async () => {
    if (activeAlert) {
      await hazardAlert.confirmHazard(activeAlert.hazard.id);
      dismissAlert();
    }
  };

  const handleViewDetails = () => {
    if (activeAlert) {
      // Dispatch event to center map on hazard
      window.dispatchEvent(new CustomEvent('viewHazard', {
        detail: {
          hazardId: activeAlert.hazard.id,
          lat: activeAlert.hazard.lat,
          lng: activeAlert.hazard.lng
        }
      }));
      dismissAlert();
    }
  };

  if (!activeAlert) return null;

  const getSeverityColor = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-safety-red border-safety-red';
      case 'warning':
        return 'bg-safety-orange border-safety-orange';
      case 'advisory':
        return 'bg-sky-600 border-sky-600';
      default:
        return 'bg-safety-orange border-safety-orange';
    }
  };

  const getSeverityIcon = (level) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle size={24} className="text-white" fill="currentColor" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-white" />;
      case 'advisory':
        return <AlertCircle size={24} className="text-white" />;
      default:
        return <AlertTriangle size={24} className="text-white" />;
    }
  };

  const { hazard, distance, bearing, severityLevel, message } = activeAlert;

  return (
    <div
      className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{ maxWidth: '90%', width: '500px' }}
    >
      <div className={`${getSeverityColor(severityLevel)} border-2 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md bg-opacity-95`}>
        {/* Alert Header */}
        <div className="p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getSeverityIcon(severityLevel)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">
              {severityLevel === 'critical' ? 'CRITICAL' : severityLevel === 'warning' ? 'WARNING' : 'ADVISORY'} ALERT
            </h3>
            <p className="text-white text-sm leading-relaxed">{message}</p>

            {/* Hazard Details */}
            <div className="mt-2 flex items-center space-x-4 text-xs text-white/90">
              {hazard.verified && (
                <div className="flex items-center space-x-1">
                  <CheckCircle size={14} />
                  <span>Verified</span>
                </div>
              )}
              {hazard.reportCount > 1 && (
                <span>{hazard.reportCount} reports</span>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={dismissAlert}
            className="flex-shrink-0 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="bg-black/20 px-4 py-3 flex items-center justify-end space-x-2">
          <button
            onClick={handleViewDetails}
            className="text-white text-sm font-semibold hover:underline"
          >
            View on Map
          </button>

          <button
            onClick={handleMarkPassed}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Passed Safely
          </button>

          <button
            onClick={handleConfirmHazard}
            className="bg-white text-gray-900 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Confirm Hazard
          </button>
        </div>
      </div>
    </div>
  );
};

export default HazardAlertBanner;
