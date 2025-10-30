import { useState } from 'react';
import { BarChart3, TrendingUp, MapPin, Award } from 'lucide-react';

const Dashboard = () => {
  const [userStats] = useState({
    tracksUploaded: 12,
    totalDistance: 342.5,
    reputationScore: 85,
    contributions: 24
  });

  const [recentTracks] = useState([
    {
      id: 1,
      name: 'Yellowknife to Blanchet Island',
      date: '2025-10-15',
      distance: 45.3,
      privacy: 'public'
    },
    {
      id: 2,
      name: 'Back Bay Loop',
      date: '2025-10-12',
      distance: 12.8,
      privacy: 'public'
    },
    {
      id: 3,
      name: 'East Arm Exploration',
      date: '2025-10-08',
      distance: 78.4,
      privacy: 'private'
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-ice-white mb-2">
          Your Dashboard
        </h1>
        <p className="text-ice-blue">Track your contributions and navigation history</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={MapPin}
          label="Tracks Uploaded"
          value={userStats.tracksUploaded}
          color="aurora-green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Distance"
          value={`${userStats.totalDistance} km`}
          color="aurora-blue"
        />
        <StatCard
          icon={Award}
          label="Reputation Score"
          value={userStats.reputationScore}
          color="tundra-gold"
        />
        <StatCard
          icon={BarChart3}
          label="Community Contributions"
          value={userStats.contributions}
          color="aurora-purple"
        />
      </div>

      {/* Recent Tracks */}
      <div className="card">
        <h2 className="text-2xl font-display font-bold text-ice-white mb-6">
          Recent Tracks
        </h2>

        <div className="space-y-4">
          {recentTracks.map(track => (
            <div
              key={track.id}
              className="flex items-center justify-between p-4 bg-midnight-dark rounded-lg hover:bg-midnight-dark/80 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <h3 className="text-ice-white font-semibold mb-1">{track.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-ice-blue">
                  <span>{track.date}</span>
                  <span>•</span>
                  <span>{track.distance} km</span>
                  <span>•</span>
                  <span className={track.privacy === 'public' ? 'text-forest-green' : 'text-tundra-gold'}>
                    {track.privacy}
                  </span>
                </div>
              </div>

              <button className="btn-secondary py-2 px-4 text-sm">
                View Details
              </button>
            </div>
          ))}
        </div>

        {recentTracks.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-ice-blue/30 mb-4" />
            <p className="text-ice-blue">No tracks uploaded yet</p>
            <button className="btn-primary mt-4">Upload Your First Track</button>
          </div>
        )}
      </div>

      {/* Contribution Leaderboard */}
      <div className="card mt-8">
        <h2 className="text-2xl font-display font-bold text-ice-white mb-6">
          Community Leaderboard
        </h2>

        <div className="space-y-3">
          {[
            { rank: 1, username: 'NorthernNavigator', score: 450 },
            { rank: 2, username: 'LakeExplorer', score: 380 },
            { rank: 3, username: 'YKBoater', score: 320 },
            { rank: 4, username: 'IceBreaker', score: 285 },
            { rank: 5, username: 'You', score: 85 }
          ].map(user => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-4 rounded-lg ${
                user.username === 'You'
                  ? 'bg-aurora-green/20 border border-aurora-green/30'
                  : 'bg-midnight-dark'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className={`text-2xl font-bold ${
                  user.rank === 1 ? 'text-tundra-gold' :
                  user.rank === 2 ? 'text-ice-blue' :
                  user.rank === 3 ? 'text-tundra-brown' :
                  'text-ice-blue/50'
                }`}>
                  #{user.rank}
                </span>
                <span className="text-ice-white font-semibold">{user.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award size={20} className="text-tundra-gold" />
                <span className="text-ice-white font-semibold">{user.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <Icon size={32} className={`text-${color}`} />
      </div>
      <div className="text-3xl font-display font-bold text-ice-white mb-1">
        {value}
      </div>
      <div className="text-sm text-ice-blue">{label}</div>
    </div>
  );
};

export default Dashboard;
