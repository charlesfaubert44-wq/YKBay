import { useState } from 'react';
import { AlertTriangle, Camera, X } from 'lucide-react';
import hazardAlert from '../services/hazardAlert';

const QuickHazardReport = ({ position, onClose, onReported }) => {
  const [hazardType, setHazardType] = useState('reef');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hazardTypes = [
    { value: 'reef', label: 'Reef' },
    { value: 'rock', label: 'Rock' },
    { value: 'shoal', label: 'Shoal' },
    { value: 'obstacle', label: 'Obstacle' },
    { value: 'debris', label: 'Debris' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'high', label: 'High', color: 'text-safety-red' },
    { value: 'medium', label: 'Medium', color: 'text-safety-orange' },
    { value: 'low', label: 'Low', color: 'text-safety-yellow' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId') || 'anonymous';

      const hazard = await hazardAlert.reportHazard({
        lat: position.lat,
        lng: position.lng,
        type: hazardType,
        severity,
        description,
        userId
      });

      alert('Hazard reported successfully! Thank you for keeping the community safe.');

      if (onReported) {
        onReported(hazard);
      }

      onClose();
    } catch (error) {
      alert(`Failed to report hazard: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-ice-blue/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-ice-white flex items-center space-x-2">
              <AlertTriangle size={24} className="text-safety-orange" />
              <span>Report Hazard</span>
            </h3>

            <button
              onClick={onClose}
              className="text-ice-blue hover:text-ice-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Location Display */}
          <div className="bg-midnight-dark/50 rounded-lg p-3 text-sm">
            <div className="text-ice-blue mb-1">Location</div>
            <div className="text-ice-white font-mono">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </div>
          </div>

          {/* Hazard Type */}
          <div>
            <label className="block text-sm text-ice-blue mb-2">Hazard Type</label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
              className="input-northern w-full"
              required
            >
              {hazardTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm text-ice-blue mb-2">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {severityLevels.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSeverity(level.value)}
                  className={`py-2 px-3 rounded-lg border-2 transition-all ${
                    severity === level.value
                      ? 'border-aurora-green bg-aurora-green/20 text-ice-white'
                      : 'border-ice-blue/30 bg-midnight-dark/50 text-ice-blue hover:border-ice-blue/50'
                  }`}
                >
                  <div className={`font-semibold ${severity === level.value ? level.color : ''}`}>
                    {level.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-ice-blue mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about the hazard..."
              className="input-northern w-full h-24 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-ice-blue/70 mt-1 text-right">
              {description.length} / 500
            </div>
          </div>

          {/* Photo Upload (Placeholder) */}
          <div className="bg-midnight-dark/30 border-2 border-dashed border-ice-blue/30 rounded-lg p-4 text-center">
            <Camera size={32} className="mx-auto text-ice-blue/50 mb-2" />
            <div className="text-sm text-ice-blue/70">
              Photo upload coming soon
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Reporting...</span>
            ) : (
              <span>Report Hazard</span>
            )}
          </button>

          <p className="text-xs text-ice-blue/70 text-center">
            Your report will be saved locally and synced when connection is available.
            It will help keep the community safe.
          </p>
        </form>
      </div>
    </div>
  );
};

export default QuickHazardReport;
