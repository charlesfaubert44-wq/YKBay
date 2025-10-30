import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Clock, AlertTriangle, FileDown, Mail,
  Edit, ArrowLeft, Phone, User, Package, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      showInfo('Please login to view trip details');
      navigate('/login');
    } else {
      fetchTripDetails();
    }
  }, [id, isAuthenticated]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTrip(response.data.trip);
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      if (error.response?.status === 404) {
        showError('Trip not found');
        navigate('/my-trips');
      } else {
        showError('Failed to load trip details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/trips/${id}/export`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSuccess('Trip exported as PDF');
    } catch (error) {
      console.error('Error exporting trip:', error);
      showError('Failed to export trip');
    }
  };

  const handleEmailTrip = async () => {
    if (!emailRecipients) {
      showError('Please enter email recipients');
      return;
    }

    const recipients = emailRecipients.split(',').map(e => e.trim()).filter(e => e);
    if (recipients.length === 0) {
      showError('Please enter valid email addresses');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/trips/${id}/email`,
        { recipients },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showSuccess(response.data.message);
        setShowEmailModal(false);
        setEmailRecipients('');
      }
    } catch (error) {
      console.error('Error emailing trip:', error);
      showError('Failed to email trip');
    }
  };

  const handleCheckIn = async (checkpointId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/trips/${id}/checkin`,
        { checkpointId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showSuccess('Checked in successfully');
        fetchTripDetails(); // Refresh trip data
      }
    } catch (error) {
      console.error('Error checking in:', error);
      showError('Failed to check in');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-ocean flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-aurora-teal border-t-transparent"></div>
          <p className="mt-4 text-stone-grey">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-deep-ocean flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={64} className="mx-auto mb-4 text-warning-amber" />
          <p className="text-xl text-frost-white mb-4">Trip not found</p>
          <button
            onClick={() => navigate('/my-trips')}
            className="px-6 py-3 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors"
          >
            Back to My Trips
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return start <= now && end >= now;
  };

  return (
    <div className="min-h-screen bg-deep-ocean p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-midnight-navy rounded-card p-6 mb-6 shadow-elevation-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <button
                onClick={() => navigate('/my-trips')}
                className="mt-1 text-stone-grey hover:text-frost-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-display font-bold text-frost-white mb-2">{trip.title}</h1>
                <div className="flex items-center space-x-4 text-arctic-ice">
                  <span className="flex items-center space-x-1">
                    <MapPin size={18} />
                    <span>{trip.activity_type}</span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trip.status === 'completed' ? 'bg-success-green text-frost-white' :
                    trip.status === 'cancelled' ? 'bg-stone-grey text-frost-white' :
                    isActive() ? 'bg-aurora-teal text-frost-white animate-pulse' :
                    'bg-warning-amber text-deep-ocean'
                  }`}>
                    {trip.status === 'planning' && !isActive() ? 'Upcoming' :
                     isActive() ? 'Active' : trip.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {trip.user_id === user?.userId && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/trip/${id}/edit`)}
                  className="px-4 py-2 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors flex items-center space-x-2"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors flex items-center space-x-2"
                >
                  <FileDown size={18} />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors flex items-center space-x-2"
                >
                  <Mail size={18} />
                  <span className="hidden sm:inline">Email</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contacts - PROMINENT */}
        {trip.emergency_contacts && trip.emergency_contacts.length > 0 && (
          <div className="bg-safety-critical/10 border-2 border-safety-critical rounded-card p-6 mb-6 shadow-elevation-2">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-safety-critical" size={24} />
              <h2 className="text-xl font-bold text-frost-white">Emergency Contacts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.emergency_contacts.map((contact, index) => (
                <div key={index} className="bg-midnight-navy/50 p-4 rounded-card">
                  <div className="flex items-start space-x-3">
                    <User className="text-safety-critical mt-1" size={20} />
                    <div className="flex-1">
                      <p className="font-semibold text-frost-white">{contact.name}</p>
                      {contact.relationship && (
                        <p className="text-sm text-arctic-ice">{contact.relationship}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center space-x-2 text-sm text-aurora-teal hover:text-aurora-teal/80"
                        >
                          <Phone size={14} />
                          <span>{contact.phone}</span>
                        </a>
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center space-x-2 text-sm text-aurora-teal hover:text-aurora-teal/80"
                          >
                            <Mail size={14} />
                            <span>{contact.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Information */}
            <div className="bg-midnight-navy rounded-card p-6 shadow-elevation-2">
              <h2 className="text-xl font-bold text-frost-white mb-4">Trip Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-arctic-ice/10">
                  <span className="text-stone-grey flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>Start Date</span>
                  </span>
                  <span className="text-frost-white">{formatDate(trip.start_date)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-arctic-ice/10">
                  <span className="text-stone-grey flex items-center space-x-2">
                    <Calendar size={18} />
                    <span>End Date</span>
                  </span>
                  <span className="text-frost-white">{formatDate(trip.end_date)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-arctic-ice/10">
                  <span className="text-stone-grey flex items-center space-x-2">
                    <Clock size={18} />
                    <span>Duration</span>
                  </span>
                  <span className="text-frost-white">
                    {trip.estimated_duration ?
                      `${Math.floor(trip.estimated_duration / 60)} hours ${trip.estimated_duration % 60} minutes` :
                      'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-arctic-ice/10">
                  <span className="text-stone-grey flex items-center space-x-2">
                    <Users size={18} />
                    <span>Group Size</span>
                  </span>
                  <span className="text-frost-white">{trip.group_size} person(s)</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-stone-grey">Difficulty</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trip.difficulty_level === 'easy' ? 'bg-success-green text-frost-white' :
                    trip.difficulty_level === 'moderate' ? 'bg-warning-amber text-deep-ocean' :
                    trip.difficulty_level === 'hard' ? 'bg-orange-500 text-frost-white' :
                    'bg-safety-critical text-frost-white'
                  }`}>
                    {trip.difficulty_level || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkpoints */}
            {trip.checkpoints && trip.checkpoints.length > 0 && (
              <div className="bg-midnight-navy rounded-card p-6 shadow-elevation-2">
                <h2 className="text-xl font-bold text-frost-white mb-4">Checkpoints</h2>
                <div className="space-y-3">
                  {trip.checkpoints.map((checkpoint, index) => (
                    <div
                      key={checkpoint.id}
                      className={`p-4 rounded-card border ${
                        checkpoint.checked_in
                          ? 'bg-success-green/10 border-success-green/30'
                          : 'bg-deep-ocean border-arctic-ice/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {checkpoint.checked_in ? (
                              <CheckCircle className="text-success-green" size={20} />
                            ) : (
                              <XCircle className="text-stone-grey" size={20} />
                            )}
                            <span className="font-semibold text-frost-white">
                              {checkpoint.name || `Checkpoint ${index + 1}`}
                            </span>
                          </div>
                          {checkpoint.expected_time && (
                            <p className="text-sm text-arctic-ice">
                              Expected: {new Date(checkpoint.expected_time).toLocaleString()}
                            </p>
                          )}
                          {checkpoint.actual_time && (
                            <p className="text-sm text-success-green">
                              Checked in: {new Date(checkpoint.actual_time).toLocaleString()}
                            </p>
                          )}
                          {checkpoint.location && (
                            <p className="text-sm text-stone-grey mt-1">
                              {checkpoint.location.lat}, {checkpoint.location.lng}
                            </p>
                          )}
                        </div>
                        {isActive() && !checkpoint.checked_in && trip.user_id === user?.userId && (
                          <button
                            onClick={() => handleCheckIn(checkpoint.id)}
                            className="px-3 py-1.5 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors text-sm"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {trip.notes && (
              <div className="bg-midnight-navy rounded-card p-6 shadow-elevation-2">
                <h2 className="text-xl font-bold text-frost-white mb-4">Notes</h2>
                <p className="text-arctic-ice whitespace-pre-wrap">{trip.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Equipment Checklist */}
            {trip.equipment_list && trip.equipment_list.length > 0 && (
              <div className="bg-midnight-navy rounded-card p-6 shadow-elevation-2">
                <h3 className="text-lg font-bold text-frost-white mb-4 flex items-center space-x-2">
                  <Package size={20} />
                  <span>Equipment Checklist</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {trip.equipment_list.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className={`w-4 h-4 rounded border ${
                        item.checked
                          ? 'bg-success-green border-success-green'
                          : 'border-arctic-ice/50'
                      }`}>
                        {item.checked && <CheckCircle size={14} className="text-frost-white" />}
                      </div>
                      <span className={`text-arctic-ice ${item.checked ? 'line-through opacity-60' : ''}`}>
                        {item.name || item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants */}
            {trip.participants && trip.participants.length > 0 && (
              <div className="bg-midnight-navy rounded-card p-6 shadow-elevation-2">
                <h3 className="text-lg font-bold text-frost-white mb-4 flex items-center space-x-2">
                  <Users size={20} />
                  <span>Participants</span>
                </h3>
                <div className="space-y-3">
                  {trip.participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-stone-grey" />
                        <span className="text-frost-white text-sm">{participant.username}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        participant.status === 'confirmed'
                          ? 'bg-success-green/20 text-success-green'
                          : participant.status === 'declined'
                          ? 'bg-safety-critical/20 text-safety-critical'
                          : 'bg-warning-amber/20 text-warning-amber'
                      }`}>
                        {participant.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-midnight-navy rounded-card p-6 shadow-elevation-2">
              <h3 className="text-lg font-bold text-frost-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 bg-aurora-teal/20 text-aurora-teal rounded-button hover:bg-aurora-teal/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileDown size={18} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="w-full px-4 py-2 bg-aurora-teal/20 text-aurora-teal rounded-button hover:bg-aurora-teal/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Mail size={18} />
                  <span>Email Trip Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-midnight-navy rounded-card p-6 max-w-md w-full shadow-elevation-3">
              <h3 className="text-xl font-bold text-frost-white mb-4">Email Trip Plan</h3>
              <div>
                <label className="block text-frost-white mb-2">Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailRecipients('');
                  }}
                  className="px-4 py-2 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailTrip}
                  className="px-4 py-2 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors flex items-center space-x-2"
                >
                  <Mail size={18} />
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetails;