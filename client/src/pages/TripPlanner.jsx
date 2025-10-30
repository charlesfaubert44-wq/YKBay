import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, AlertTriangle, Save, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ActivitySelector from '../components/ActivitySelector';
import TripWizard from '../components/TripWizard';
import EquipmentChecklist from '../components/EquipmentChecklist';
import EmergencyContacts from '../components/EmergencyContacts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const TripPlanner = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [tripData, setTripData] = useState({
    title: '',
    activity_type: '',
    start_date: '',
    end_date: '',
    start_location: null,
    end_location: null,
    route_data: [],
    difficulty_level: 'moderate',
    estimated_duration: 0,
    group_size: 1,
    emergency_contacts: [],
    equipment_list: [],
    notes: '',
    weather_conditions: null,
    is_public: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      showInfo('Please login to plan a trip');
      navigate('/login');
    }
    fetchActivities();
  }, [isAuthenticated]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/activities`);
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showError('Failed to load activity types');
    }
  };

  const updateTripData = (field, value) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleActivitySelect = (activityName) => {
    updateTripData('activity_type', activityName);
    // Load default equipment for this activity
    const activity = activities.find(a => a.name === activityName);
    if (activity && activity.required_equipment) {
      updateTripData('equipment_list', activity.required_equipment.map(item => ({ name: item, checked: false })));
    }
    setCurrentStep(2);
  };

  const handleSaveTrip = async () => {
    if (!tripData.title || !tripData.activity_type || !tripData.start_date) {
      showError('Please fill in required fields: Title, Activity, and Start Date');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/trips`,
        tripData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        showSuccess('Trip plan saved successfully!');
        navigate(`/trip/${response.data.trip.id}`);
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      showError(error.response?.data?.error || 'Failed to save trip plan');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (tripData.start_date && tripData.end_date) {
      const start = new Date(tripData.start_date);
      const end = new Date(tripData.end_date);
      const durationMs = end - start;
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      updateTripData('estimated_duration', durationMinutes);
    }
  };

  useEffect(() => {
    calculateDuration();
  }, [tripData.start_date, tripData.end_date]);

  const steps = [
    { id: 1, name: 'Activity', icon: MapPin },
    { id: 2, name: 'Details', icon: Calendar },
    { id: 3, name: 'Participants', icon: Users },
    { id: 4, name: 'Equipment', icon: AlertTriangle },
    { id: 5, name: 'Review', icon: Save }
  ];

  return (
    <div className="min-h-screen bg-deep-ocean p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-midnight-navy rounded-card p-6 mb-6 shadow-elevation-2">
          <h1 className="text-3xl font-display font-bold text-frost-white mb-2">
            Plan Your Adventure
          </h1>
          <p className="text-arctic-ice">
            Create a comprehensive trip plan with safety information, equipment lists, and emergency contacts
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-midnight-navy rounded-card p-4 mb-6 shadow-elevation-1">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <button
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-button transition-all ${
                    step.id === currentStep
                      ? 'bg-aurora-teal text-frost-white'
                      : step.id < currentStep
                      ? 'bg-aurora-teal/30 text-frost-white hover:bg-aurora-teal/40'
                      : 'bg-frost-white/10 text-stone-grey'
                  }`}
                  disabled={step.id > currentStep}
                >
                  <step.icon size={20} />
                  <span className="hidden sm:inline">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-aurora-teal' : 'bg-frost-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-midnight-navy rounded-card p-6 shadow-elevation-3">
          {/* Step 1: Activity Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-frost-white mb-4">Choose Your Activity</h2>
              <ActivitySelector
                activities={activities}
                onSelect={handleActivitySelect}
                selectedActivity={tripData.activity_type}
              />
            </div>
          )}

          {/* Step 2: Trip Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-frost-white mb-4">Trip Details</h2>

              <div>
                <label className="block text-frost-white mb-2">Trip Title *</label>
                <input
                  type="text"
                  value={tripData.title}
                  onChange={(e) => updateTripData('title', e.target.value)}
                  className="w-full px-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                  placeholder="e.g., Weekend Fishing at Great Slave Lake"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-frost-white mb-2">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={tripData.start_date}
                    onChange={(e) => updateTripData('start_date', e.target.value)}
                    className="w-full px-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-frost-white mb-2">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={tripData.end_date}
                    onChange={(e) => updateTripData('end_date', e.target.value)}
                    min={tripData.start_date}
                    className="w-full px-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-frost-white mb-2">Difficulty Level</label>
                  <select
                    value={tripData.difficulty_level}
                    onChange={(e) => updateTripData('difficulty_level', e.target.value)}
                    className="w-full px-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-frost-white mb-2">Group Size</label>
                  <input
                    type="number"
                    min="1"
                    value={tripData.group_size}
                    onChange={(e) => updateTripData('group_size', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                  />
                </div>
              </div>

              {tripData.estimated_duration > 0 && (
                <div className="bg-aurora-teal/10 p-4 rounded-button">
                  <div className="flex items-center space-x-2 text-aurora-teal">
                    <Clock size={20} />
                    <span>Estimated Duration: {Math.floor(tripData.estimated_duration / 60)} hours {tripData.estimated_duration % 60} minutes</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors"
                >
                  Next: Participants
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contacts */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-frost-white mb-4">Emergency Contacts & Participants</h2>

              <EmergencyContacts
                contacts={tripData.emergency_contacts}
                onChange={(contacts) => updateTripData('emergency_contacts', contacts)}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors"
                >
                  Next: Equipment
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Equipment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-frost-white mb-4">Equipment Checklist</h2>

              <EquipmentChecklist
                equipment={tripData.equipment_list}
                onChange={(equipment) => updateTripData('equipment_list', equipment)}
                activityType={tripData.activity_type}
              />

              <div>
                <label className="block text-frost-white mb-2">Additional Notes</label>
                <textarea
                  value={tripData.notes}
                  onChange={(e) => updateTripData('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                  placeholder="Any additional information about your trip..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review and Save */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-frost-white mb-4">Review Your Trip Plan</h2>

              <div className="bg-deep-ocean p-6 rounded-card space-y-4">
                <h3 className="text-xl font-bold text-aurora-teal">{tripData.title || 'Untitled Trip'}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-frost-white">
                  <div>
                    <span className="text-stone-grey">Activity:</span> {tripData.activity_type}
                  </div>
                  <div>
                    <span className="text-stone-grey">Difficulty:</span> {tripData.difficulty_level}
                  </div>
                  <div>
                    <span className="text-stone-grey">Start:</span> {new Date(tripData.start_date).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-stone-grey">End:</span> {new Date(tripData.end_date).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-stone-grey">Group Size:</span> {tripData.group_size} person(s)
                  </div>
                  <div>
                    <span className="text-stone-grey">Emergency Contacts:</span> {tripData.emergency_contacts.length}
                  </div>
                </div>

                {tripData.notes && (
                  <div className="pt-4 border-t border-arctic-ice/20">
                    <span className="text-stone-grey">Notes:</span>
                    <p className="text-frost-white mt-1">{tripData.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-frost-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tripData.is_public}
                    onChange={(e) => updateTripData('is_public', e.target.checked)}
                    className="w-4 h-4 text-aurora-teal bg-deep-ocean border-arctic-ice/20 rounded focus:ring-aurora-teal"
                  />
                  <span>Make this trip public (others can view it)</span>
                </label>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors"
                >
                  Back
                </button>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveTrip}
                    disabled={loading}
                    className="px-6 py-3 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Trip Plan'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;