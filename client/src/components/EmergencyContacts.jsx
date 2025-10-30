import { useState } from 'react';
import { Phone, Mail, User, AlertTriangle, Plus, X, GripVertical } from 'lucide-react';

const EmergencyContacts = ({ contacts = [], onChange }) => {
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState({});

  const validateContact = () => {
    const newErrors = {};
    if (!newContact.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!newContact.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    // Basic phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (newContact.phone && !phoneRegex.test(newContact.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    // Email validation if provided
    if (newContact.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newContact.email)) {
        newErrors.email = 'Invalid email address';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddContact = () => {
    if (validateContact()) {
      onChange([...contacts, { ...newContact, id: Date.now() }]);
      setNewContact({ name: '', phone: '', email: '', relationship: '' });
      setShowAddForm(false);
      setErrors({});
    }
  };

  const handleRemoveContact = (id) => {
    onChange(contacts.filter(contact => contact.id !== id));
  };

  const handleMoveContact = (index, direction) => {
    const newContacts = [...contacts];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < contacts.length) {
      [newContacts[index], newContacts[newIndex]] = [newContacts[newIndex], newContacts[index]];
      onChange(newContacts);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Warning */}
      <div className="bg-safety-critical/10 border border-safety-critical/30 rounded-card p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-safety-critical mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-frost-white">Emergency Contacts are Critical</h3>
            <p className="text-sm text-arctic-ice mt-1">
              These contacts will be prominently displayed on all exported trip plans.
              Ensure phone numbers are correct and contacts are aware of your trip.
            </p>
          </div>
        </div>
      </div>

      {/* Existing Contacts */}
      <div className="space-y-2">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="bg-deep-ocean p-4 rounded-card border border-arctic-ice/20 group hover:border-aurora-teal/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Drag Handle */}
                <div className="mt-1 text-stone-grey opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <GripVertical size={20} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="text-aurora-teal" size={18} />
                    <span className="font-semibold text-frost-white">{contact.name}</span>
                    {contact.relationship && (
                      <span className="text-xs px-2 py-1 bg-aurora-teal/20 text-aurora-teal rounded-full">
                        {contact.relationship}
                      </span>
                    )}
                    {index === 0 && (
                      <span className="text-xs px-2 py-1 bg-safety-critical/20 text-safety-critical rounded-full">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="text-stone-grey" size={14} />
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-arctic-ice hover:text-aurora-teal transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                    {contact.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="text-stone-grey" size={14} />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-arctic-ice hover:text-aurora-teal transition-colors"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Move Up/Down */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleMoveContact(index, 'up')}
                    disabled={index === 0}
                    className="text-stone-grey hover:text-frost-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveContact(index, 'down')}
                    disabled={index === contacts.length - 1}
                    className="text-stone-grey hover:text-frost-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemoveContact(contact.id)}
                  className="text-stone-grey hover:text-safety-critical transition-colors"
                  title="Remove contact"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {contacts.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-stone-grey">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No emergency contacts added yet</p>
            <p className="text-sm mt-1">Add at least one emergency contact for safety</p>
          </div>
        )}
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="bg-deep-ocean p-6 rounded-card border-2 border-aurora-teal">
          <h4 className="font-semibold text-frost-white mb-4">Add Emergency Contact</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-frost-white text-sm mb-1">
                Full Name <span className="text-safety-critical">*</span>
              </label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className={`w-full px-3 py-2 bg-midnight-navy text-frost-white rounded-button border ${
                  errors.name ? 'border-safety-critical' : 'border-arctic-ice/20'
                } focus:border-aurora-teal focus:outline-none`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-safety-critical text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-frost-white text-sm mb-1">
                Phone Number <span className="text-safety-critical">*</span>
              </label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className={`w-full px-3 py-2 bg-midnight-navy text-frost-white rounded-button border ${
                  errors.phone ? 'border-safety-critical' : 'border-arctic-ice/20'
                } focus:border-aurora-teal focus:outline-none`}
                placeholder="+1 (867) 555-0123"
              />
              {errors.phone && (
                <p className="text-safety-critical text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-frost-white text-sm mb-1">Email Address</label>
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className={`w-full px-3 py-2 bg-midnight-navy text-frost-white rounded-button border ${
                  errors.email ? 'border-safety-critical' : 'border-arctic-ice/20'
                } focus:border-aurora-teal focus:outline-none`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-safety-critical text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-frost-white text-sm mb-1">Relationship</label>
              <input
                type="text"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-3 py-2 bg-midnight-navy text-frost-white rounded-button border border-arctic-ice/20 focus:border-aurora-teal focus:outline-none"
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewContact({ name: '', phone: '', email: '', relationship: '' });
                setErrors({});
              }}
              className="px-4 py-2 bg-frost-white/10 text-frost-white rounded-button hover:bg-frost-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddContact}
              className="px-4 py-2 bg-aurora-teal text-frost-white rounded-button hover:bg-aurora-teal/80 transition-colors"
            >
              Add Contact
            </button>
          </div>
        </div>
      )}

      {/* Add Contact Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 bg-aurora-teal/10 text-aurora-teal rounded-button hover:bg-aurora-teal/20 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Emergency Contact</span>
        </button>
      )}

      {/* Recommendation */}
      {contacts.length > 0 && contacts.length < 2 && (
        <div className="text-sm text-stone-grey text-center">
          Consider adding at least 2 emergency contacts for redundancy
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;