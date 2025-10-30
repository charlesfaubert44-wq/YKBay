import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Clock, FileDown, Mail, Eye,
  Edit, Trash2, Plus, Filter, Search, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const MyTrips = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, active
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      showInfo('Please login to view your trips');
      navigate('/login');
    } else {
      fetchTrips();
    }
  }, [isAuthenticated]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/trips`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      showError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showSuccess('Trip deleted successfully');
        fetchTrips();
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      showError('Failed to delete trip');
    }
  };

  const handleExportPDF = async (tripId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/trips/${tripId}/export`,
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
      link.setAttribute('download', `trip-${tripId}.pdf`);
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
    if (!selectedTrip || !emailRecipients) {
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
        `${API_URL}/api/trips/${selectedTrip.id}/email`,
        { recipients },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        showSuccess(response.data.message);
        setShowExportModal(false);
        setSelectedTrip(null);
        setEmailRecipients('');
      }
    } catch (error) {
      console.error('Error emailing trip:', error);
      showError('Failed to email trip');
    }
  };

  // Filter trips
  const filteredTrips = trips.filter(trip => {
    const now = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    let matchesFilter = true;
    switch (filter) {
      case 'upcoming':
        matchesFilter = startDate > now && trip.status !== 'cancelled';
        break;
      case 'active':
        matchesFilter = trip.status === 'active' || (startDate <= now && endDate >= now);
        break;
      case 'past':
        matchesFilter = endDate < now || trip.status === 'completed';
        break;
      case 'cancelled':
        matchesFilter = trip.status === 'cancelled';
        break;
    }

    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.activity_type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (trip) => {
    const now = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    if (trip.status === 'cancelled') return 'bg-stone-grey text-frost-white';
    if (trip.status === 'completed') return 'bg-success-green text-frost-white';
    if (startDate <= now && endDate >= now) return 'bg-aurora-teal text-frost-white animate-pulse';
    if (startDate > now) return 'bg-warning-amber text-deep-ocean';
    return 'bg-stone-grey text-frost-white';
  };

  const getStatusText = (trip) => {
    const now = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    if (trip.status === 'cancelled') return 'Cancelled';
    if (trip.status === 'completed') return 'Completed';
    if (startDate <= now && endDate >= now) return 'Active';
    if (startDate > now) return 'Upcoming';
    return 'Past';
  };

  return (
    <div className="min-h-screen bg-deep-ocean p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-midnight-navy rounded-card p-6 mb-6 shadow-elevation-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-display font-bold text-frost-white mb-2">My Trips</h1>
              <p className="text-arctic-ice">Manage and track all your outdoor adventures</p>
            </div>
            <button
              onClick={() => navigate('/trip-planner')}
              className="mt-4 sm:mt-0 px-6 py-3 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Plan New Trip</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-midnight-navy rounded-card p-4 mb-6 shadow-elevation-1">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'upcoming', 'active', 'past', 'cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-button capitalize transition-all ${
                    filter === f
                      ? 'bg-aurora-teal text-frost-white'
                      : 'bg-frost-white/10 text-arctic-ice hover:bg-frost-white/20'
                  }`}
                >
                  {f}
                  <span className="ml-2 text-xs opacity-70">
                    ({trips.filter(t => {
                      if (f === 'all') return true;
                      const now = new Date();
                      const start = new Date(t.start_date);
                      const end = new Date(t.end_date);
                      if (f === 'upcoming') return start > now && t.status !== 'cancelled';
                      if (f === 'active') return t.status === 'active' || (start <= now && end >= now);
                      if (f === 'past') return end < now || t.status === 'completed';
                      if (f === 'cancelled') return t.status === 'cancelled';
                    }).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-grey" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search trips..."
                className="w-full pl-10 pr-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-aurora-teal border-t-transparent"></div>
            <p className="mt-4 text-stone-grey">Loading trips...</p>
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid gap-4">
            {filteredTrips.map(trip => (
              <div
                key={trip.id}
                className="bg-midnight-navy rounded-card p-6 shadow-elevation-2 hover:shadow-elevation-3 transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between">
                  {/* Trip Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-frost-white mb-1">{trip.title}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip)}`}>
                          {getStatusText(trip)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center space-x-2 text-arctic-ice">
                        <MapPin size={16} className="text-stone-grey" />
                        <span className="text-sm">{trip.activity_type}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-arctic-ice">
                        <Calendar size={16} className="text-stone-grey" />
                        <span className="text-sm">{new Date(trip.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-arctic-ice">
                        <Clock size={16} className="text-stone-grey" />
                        <span className="text-sm">
                          {trip.estimated_duration ? `${Math.floor(trip.estimated_duration / 60)}h ${trip.estimated_duration % 60}m` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-arctic-ice">
                        <Users size={16} className="text-stone-grey" />
                        <span className="text-sm">{trip.group_size} person(s)</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/trip/${trip.id}`)}
                        className="px-3 py-1.5 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors flex items-center space-x-1.5 text-sm"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => navigate(`/trip/${trip.id}/edit`)}
                        className="px-3 py-1.5 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors flex items-center space-x-1.5 text-sm"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleExportPDF(trip.id)}
                        className="px-3 py-1.5 bg-aurora-teal/20 text-aurora-teal rounded-button hover:bg-aurora-teal/30 transition-colors flex items-center space-x-1.5 text-sm"
                      >
                        <FileDown size={16} />
                        <span>Export PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrip(trip);
                          setShowExportModal(true);
                        }}
                        className="px-3 py-1.5 bg-aurora-teal/20 text-aurora-teal rounded-button hover:bg-aurora-teal/30 transition-colors flex items-center space-x-1.5 text-sm"
                      >
                        <Mail size={16} />
                        <span>Email</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="px-3 py-1.5 bg-safety-critical/20 text-safety-critical rounded-button hover:bg-safety-critical/30 transition-colors flex items-center space-x-1.5 text-sm"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="bg-deep-ocean rounded-card p-4 space-y-2">
                      {trip.emergency_contacts && JSON.parse(trip.emergency_contacts).length > 0 && (
                        <div className="text-sm">
                          <span className="text-stone-grey">Emergency Contacts:</span>
                          <span className="ml-2 text-success-green">✓ {JSON.parse(trip.emergency_contacts).length}</span>
                        </div>
                      )}
                      {trip.equipment_list && JSON.parse(trip.equipment_list).length > 0 && (
                        <div className="text-sm">
                          <span className="text-stone-grey">Equipment Items:</span>
                          <span className="ml-2 text-frost-white">{JSON.parse(trip.equipment_list).length}</span>
                        </div>
                      )}
                      {trip.is_public && (
                        <div className="text-sm">
                          <span className="text-aurora-teal">Public Trip</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto mb-4 text-stone-grey opacity-50" />
            <p className="text-xl text-frost-white mb-2">No trips found</p>
            <p className="text-stone-grey mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Start planning your first adventure!'}
            </p>
            <button
              onClick={() => navigate('/trip-planner')}
              className="px-6 py-3 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Plan Your First Trip</span>
            </button>
          </div>
        )}

        {/* Email Modal */}
        {showExportModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-midnight-navy rounded-card p-6 max-w-md w-full shadow-elevation-3">
              <h3 className="text-xl font-bold text-frost-white mb-4">Email Trip Plan</h3>
              <p className="text-arctic-ice mb-4">
                Send trip plan for: <strong>{selectedTrip.title}</strong>
              </p>
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
                    setShowExportModal(false);
                    setSelectedTrip(null);
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

export default MyTrips;