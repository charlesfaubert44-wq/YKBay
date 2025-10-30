import { useState } from 'react';
import {
  Anchor, Fish, Mountain, Snowflake, Trees, Camera,
  Truck, Target, Activity, Ship, Wind, Binoculars
} from 'lucide-react';

const ActivitySelector = ({ activities, onSelect, selectedActivity }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Icon mapping for activities
  const getActivityIcon = (name) => {
    const iconMap = {
      'Boating': Anchor,
      'Kayaking': Ship,
      'Canoeing': Ship,
      'Fishing': Fish,
      'Ice Fishing': Fish,
      'Snowmobiling': Snowflake,
      'Cross-country Skiing': Snowflake,
      'Snowshoeing': Snowflake,
      'Hiking': Mountain,
      'Camping': Trees,
      'ATV Riding': Truck,
      'Hunting': Target,
      'Ice Climbing': Mountain,
      'Rock Climbing': Mountain,
      'Wildlife Viewing': Binoculars,
      'Photography': Camera
    };
    return iconMap[name] || Activity;
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'water': 'bg-blue-500/20 text-blue-400 border-blue-500',
      'winter': 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
      'land': 'bg-green-500/20 text-green-400 border-green-500',
      'climbing': 'bg-orange-500/20 text-orange-400 border-orange-500'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500';
  };

  const categories = [
    { id: 'all', name: 'All Activities', icon: Activity },
    { id: 'water', name: 'Water', icon: Anchor },
    { id: 'winter', name: 'Winter', icon: Snowflake },
    { id: 'land', name: 'Land', icon: Mountain },
    { id: 'climbing', name: 'Climbing', icon: Mountain }
  ];

  const filteredActivities = selectedCategory === 'all'
    ? activities
    : activities.filter(a => a.category === selectedCategory);

  // Check if activity is available in current month
  const isSeasonallyAvailable = (activity) => {
    if (!activity.seasonal_availability?.months) return true;
    const currentMonth = new Date().getMonth() + 1;
    return activity.seasonal_availability.months.includes(currentMonth);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-button flex items-center space-x-2 transition-all ${
                selectedCategory === category.id
                  ? 'bg-aurora-teal text-frost-white shadow-aurora'
                  : 'bg-frost-white/10 text-arctic-ice hover:bg-frost-white/20'
              }`}
            >
              <Icon size={18} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredActivities.map(activity => {
          const Icon = getActivityIcon(activity.name);
          const isAvailable = isSeasonallyAvailable(activity);
          const isSelected = selectedActivity === activity.name;

          return (
            <button
              key={activity.id}
              onClick={() => onSelect(activity.name)}
              disabled={!isAvailable}
              className={`relative p-6 rounded-card transition-all duration-200 ${
                isSelected
                  ? 'bg-aurora-teal shadow-elevation-3 scale-105'
                  : isAvailable
                  ? 'bg-frost-white/10 hover:bg-frost-white/20 hover:shadow-elevation-2 hover:scale-102'
                  : 'bg-frost-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Category Badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${getCategoryColor(activity.category)}`}>
                {activity.category}
              </div>

              {/* Icon */}
              <div className={`mb-3 ${isSelected ? 'text-frost-white' : 'text-aurora-teal'}`}>
                <Icon size={32} />
              </div>

              {/* Activity Name */}
              <h3 className={`font-semibold text-lg mb-1 ${
                isSelected ? 'text-frost-white' : 'text-frost-white'
              }`}>
                {activity.name}
              </h3>

              {/* Availability Status */}
              {!isAvailable && (
                <p className="text-xs text-stone-grey mt-2">Out of Season</p>
              )}

              {/* Equipment Count */}
              {activity.required_equipment && (
                <p className={`text-xs mt-2 ${isSelected ? 'text-frost-white/80' : 'text-stone-grey'}`}>
                  {activity.required_equipment.length} required items
                </p>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-3 h-3 bg-frost-white rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-8 text-stone-grey">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>No activities found in this category</p>
        </div>
      )}
    </div>
  );
};

export default ActivitySelector;