import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const UploadTrack = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [trackMetadata, setTrackMetadata] = useState({
    vesselType: 'aluminum-boat',
    vesselDraft: '',
    waterLevel: '',
    conditions: {
      windSpeed: '',
      waveHeight: '',
      visibility: 'good'
    },
    notes: '',
    privacy: 'public'
  });

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles(acceptedFiles.map(file => ({
      file,
      status: 'ready'
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/gpx+xml': ['.gpx'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
      'text/csv': ['.csv']
    },
    multiple: true
  });

  const handleUpload = async () => {
    setUploading(true);

    // Simulate upload process
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(f => ({
        ...f,
        status: 'success'
      })));
      setUploading(false);
    }, 2000);
  };

  const handleMetadataChange = (field, value) => {
    setTrackMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConditionChange = (field, value) => {
    setTrackMetadata(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value
      }
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-ice-white mb-2">
          Upload GPS Track
        </h1>
        <p className="text-ice-blue">
          Share your navigation data to help the community navigate safely
        </p>
      </div>

      {/* File Upload Area */}
      <div className="card mb-8">
        <h2 className="text-xl font-display font-bold text-ice-white mb-4">
          Track Files
        </h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-aurora-green bg-aurora-green/10'
              : 'border-ice-blue/30 hover:border-aurora-green/50 hover:bg-ice-white/5'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={48} className="mx-auto text-aurora-green mb-4" />
          {isDragActive ? (
            <p className="text-ice-white text-lg">Drop files here...</p>
          ) : (
            <div>
              <p className="text-ice-white text-lg mb-2">
                Drag & drop track files here, or click to browse
              </p>
              <p className="text-ice-blue text-sm">
                Supported formats: GPX, KML, CSV (max 10MB per file)
              </p>
            </div>
          )}
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            {uploadedFiles.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-midnight-dark rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText size={24} className="text-aurora-blue" />
                  <div>
                    <p className="text-ice-white font-semibold">{item.file.name}</p>
                    <p className="text-ice-blue text-sm">
                      {(item.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div>
                  {item.status === 'ready' && (
                    <span className="badge-info">Ready</span>
                  )}
                  {item.status === 'success' && (
                    <CheckCircle size={24} className="text-forest-green" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle size={24} className="text-safety-red" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Track Metadata */}
      <div className="card mb-8">
        <h2 className="text-xl font-display font-bold text-ice-white mb-6">
          Track Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vessel Type */}
          <div>
            <label className="block text-sm font-semibold text-ice-blue mb-2">
              Vessel Type
            </label>
            <select
              value={trackMetadata.vesselType}
              onChange={(e) => handleMetadataChange('vesselType', e.target.value)}
              className="input-northern"
            >
              <option value="aluminum-boat">Aluminum Boat</option>
              <option value="canoe">Canoe</option>
              <option value="kayak">Kayak</option>
              <option value="yacht">Yacht</option>
              <option value="fishing-boat">Fishing Boat</option>
              <option value="houseboat">Houseboat</option>
            </select>
          </div>

          {/* Vessel Draft */}
          <div>
            <label className="block text-sm font-semibold text-ice-blue mb-2">
              Vessel Draft (meters)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 0.6"
              value={trackMetadata.vesselDraft}
              onChange={(e) => handleMetadataChange('vesselDraft', e.target.value)}
              className="input-northern"
            />
          </div>

          {/* Water Level */}
          <div>
            <label className="block text-sm font-semibold text-ice-blue mb-2">
              Water Level (m above sea level)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 156.2"
              value={trackMetadata.waterLevel}
              onChange={(e) => handleMetadataChange('waterLevel', e.target.value)}
              className="input-northern"
            />
          </div>

          {/* Wind Speed */}
          <div>
            <label className="block text-sm font-semibold text-ice-blue mb-2">
              Wind Speed (km/h)
            </label>
            <input
              type="number"
              placeholder="e.g., 15"
              value={trackMetadata.conditions.windSpeed}
              onChange={(e) => handleConditionChange('windSpeed', e.target.value)}
              className="input-northern"
            />
          </div>

          {/* Wave Height */}
          <div>
            <label className="block text-sm font-semibold text-ice-blue mb-2">
              Wave Height (meters)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 0.3"
              value={trackMetadata.conditions.waveHeight}
              onChange={(e) => handleConditionChange('waveHeight', e.target.value)}
              className="input-northern"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-ice-blue mb-2">
              Visibility
            </label>
            <select
              value={trackMetadata.conditions.visibility}
              onChange={(e) => handleConditionChange('visibility', e.target.value)}
              className="input-northern"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="moderate">Moderate</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-ice-blue mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows="4"
            placeholder="Any observations, hazards, or notes about this route..."
            value={trackMetadata.notes}
            onChange={(e) => handleMetadataChange('notes', e.target.value)}
            className="input-northern resize-none"
          />
        </div>

        {/* Privacy Setting */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-ice-blue mb-2">
            Privacy
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={trackMetadata.privacy === 'public'}
                onChange={(e) => handleMetadataChange('privacy', e.target.value)}
                className="mr-2"
              />
              <span className="text-ice-white">Public (help the community)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={trackMetadata.privacy === 'private'}
                onChange={(e) => handleMetadataChange('privacy', e.target.value)}
                className="mr-2"
              />
              <span className="text-ice-white">Private (only visible to you)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button className="btn-secondary">Cancel</button>
        <button
          onClick={handleUpload}
          disabled={uploadedFiles.length === 0 || uploading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <span className="spinner-aurora mr-2"></span>
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} className="mr-2 inline" />
              Upload Track
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadTrack;
