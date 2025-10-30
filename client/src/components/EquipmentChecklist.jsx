import { useState, useEffect } from 'react';
import { Package, Plus, X, Check, AlertTriangle, Search } from 'lucide-react';

const EquipmentChecklist = ({ equipment = [], onChange, activityType }) => {
  const [newItem, setNewItem] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Common equipment categories
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'safety', name: 'Safety' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'shelter', name: 'Shelter' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'food', name: 'Food & Water' },
    { id: 'tools', name: 'Tools' },
    { id: 'medical', name: 'Medical' },
    { id: 'communication', name: 'Communication' },
    { id: 'custom', name: 'Custom' }
  ];

  // Suggested equipment based on common needs
  const suggestedItems = {
    safety: ['First Aid Kit', 'Emergency Whistle', 'Bear Spray', 'Flares', 'Life Jacket', 'Helmet'],
    navigation: ['GPS Device', 'Map', 'Compass', 'Satellite Phone', 'InReach Device'],
    shelter: ['Tent', 'Sleeping Bag', 'Tarp', 'Emergency Bivvy', 'Ground Sheet'],
    clothing: ['Extra Layers', 'Rain Gear', 'Warm Hat', 'Gloves', 'Extra Socks', 'Sun Protection'],
    food: ['Water (4L/day)', 'Water Filter', 'Food (3 days)', 'Cooking Stove', 'Fuel', 'Bear Canister'],
    tools: ['Multi-tool', 'Knife', 'Rope', 'Duct Tape', 'Cable Ties', 'Repair Kit'],
    medical: ['Medications', 'Bandages', 'Pain Relievers', 'Antiseptic', 'Emergency Blanket'],
    communication: ['Cell Phone', 'Radio', 'Emergency Beacon', 'Signal Mirror', 'Whistle']
  };

  // Initialize equipment list with defaults if empty
  useEffect(() => {
    if (equipment.length === 0 && activityType) {
      // Add essential items for any trip
      const essentials = [
        { name: 'First Aid Kit', category: 'safety', checked: false, essential: true },
        { name: 'Emergency Communication Device', category: 'communication', checked: false, essential: true },
        { name: 'Extra Food & Water', category: 'food', checked: false, essential: true },
        { name: 'Navigation Tools', category: 'navigation', checked: false, essential: true }
      ];
      onChange(essentials);
    }
  }, [activityType]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      const item = {
        id: Date.now(),
        name: newItem.trim(),
        category: 'custom',
        checked: false,
        essential: false
      };
      onChange([...equipment, item]);
      setNewItem('');
      setShowAddForm(false);
    }
  };

  const handleToggleItem = (index) => {
    const updated = [...equipment];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    onChange(updated);
  };

  const handleRemoveItem = (index) => {
    onChange(equipment.filter((_, i) => i !== index));
  };

  const handleAddSuggestedItem = (itemName, category) => {
    const exists = equipment.some(e => e.name === itemName);
    if (!exists) {
      const item = {
        id: Date.now(),
        name: itemName,
        category: category,
        checked: false,
        essential: false
      };
      onChange([...equipment, item]);
    }
  };

  // Filter equipment based on search and category
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate progress
  const totalItems = equipment.length;
  const checkedItems = equipment.filter(e => e.checked).length;
  const essentialItems = equipment.filter(e => e.essential);
  const essentialChecked = essentialItems.filter(e => e.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-deep-ocean p-4 rounded-card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-frost-white font-semibold">Packing Progress</span>
          <span className="text-aurora-teal">{checkedItems} / {totalItems} items</span>
        </div>
        <div className="w-full bg-frost-white/20 rounded-full h-2">
          <div
            className="bg-aurora-teal h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {essentialItems.length > 0 && (
          <div className="mt-2 text-sm">
            <span className={essentialChecked === essentialItems.length ? 'text-success-green' : 'text-warning-amber'}>
              Essential items: {essentialChecked} / {essentialItems.length}
            </span>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-grey" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment..."
            className="w-full pl-10 pr-4 py-2 bg-deep-ocean text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-button text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-aurora-teal text-frost-white'
                  : 'bg-frost-white/10 text-arctic-ice hover:bg-frost-white/20'
              }`}
            >
              {cat.name}
              {cat.id !== 'all' && (
                <span className="ml-1 text-xs opacity-70">
                  ({equipment.filter(e => e.category === cat.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEquipment.map((item, index) => (
          <div
            key={item.id || index}
            className={`bg-deep-ocean p-3 rounded-card border transition-all ${
              item.checked
                ? 'border-success-green/50 bg-success-green/5'
                : 'border-arctic-ice/20 hover:border-aurora-teal/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <button
                  onClick={() => handleToggleItem(index)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    item.checked
                      ? 'bg-success-green border-success-green'
                      : 'border-arctic-ice/50 hover:border-aurora-teal'
                  }`}
                >
                  {item.checked && <Check size={14} className="text-frost-white" />}
                </button>

                <div className="flex-1">
                  <span className={`text-frost-white ${item.checked ? 'line-through opacity-70' : ''}`}>
                    {item.name || item}
                  </span>
                  {item.essential && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-warning-amber/20 text-warning-amber rounded-full">
                      Essential
                    </span>
                  )}
                  {item.category && item.category !== 'custom' && (
                    <span className="ml-2 text-xs text-stone-grey">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              {!item.essential && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-stone-grey hover:text-safety-critical transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredEquipment.length === 0 && (
          <div className="text-center py-8 text-stone-grey">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No equipment items found</p>
            {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
          </div>
        )}
      </div>

      {/* Suggested Items */}
      {selectedCategory !== 'all' && selectedCategory !== 'custom' && suggestedItems[selectedCategory] && (
        <div className="bg-deep-ocean/50 p-4 rounded-card">
          <h4 className="text-sm font-semibold text-frost-white mb-2">Suggested {categories.find(c => c.id === selectedCategory)?.name} Items:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedItems[selectedCategory].map(item => {
              const exists = equipment.some(e => e.name === item);
              return (
                <button
                  key={item}
                  onClick={() => !exists && handleAddSuggestedItem(item, selectedCategory)}
                  disabled={exists}
                  className={`px-3 py-1 rounded-button text-xs transition-colors ${
                    exists
                      ? 'bg-frost-white/5 text-stone-grey cursor-not-allowed'
                      : 'bg-aurora-teal/20 text-aurora-teal hover:bg-aurora-teal/30'
                  }`}
                >
                  {exists ? '✓ ' : '+ '}{item}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Custom Item */}
      {showAddForm ? (
        <div className="bg-deep-ocean p-4 rounded-card border border-aurora-teal">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Enter item name..."
              className="flex-1 px-3 py-2 bg-midnight-navy text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewItem('');
              }}
              className="px-4 py-2 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 bg-aurora-teal/10 text-aurora-teal rounded-button hover:bg-aurora-teal/20 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Custom Item</span>
        </button>
      )}

      {/* Safety Reminder */}
      <div className="bg-warning-amber/10 border border-warning-amber/30 rounded-card p-3">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="text-warning-amber mt-0.5" size={16} />
          <p className="text-xs text-arctic-ice">
            Always verify your equipment is in good working condition before departure.
            Pack according to expected conditions and duration of your trip.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquipmentChecklist;