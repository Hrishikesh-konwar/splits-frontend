import React, { useState } from 'react';

const CreateGroupModal = ({ onClose, onSubmit }) => {
  const [groupName, setGroupName] = useState('');
  const [memberContacts, setMemberContacts] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addMemberField = () => {
    setMemberContacts([...memberContacts, '']);
  };

  const removeMemberField = (index) => {
    const newContacts = memberContacts.filter((_, i) => i !== index);
    setMemberContacts(newContacts);
  };

  const updateMemberContact = (index, value) => {
    const newContacts = [...memberContacts];
    newContacts[index] = value;
    setMemberContacts(newContacts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const validContacts = memberContacts.filter(contact => contact.trim() !== '');
      if (validContacts.length === 0) {
        throw new Error('Please add at least one member');
      }

      await onSubmit({
        groupName,
        members: validContacts.map(contact => parseInt(contact))
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✨ Create New Group</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="form-control"
              placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
              required
            />
          </div>

          <div className="form-group">
            <label>Add Members by Contact Number</label>
            {memberContacts.map((contact, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="number"
                  value={contact}
                  onChange={(e) => updateMemberContact(index, e.target.value)}
                  className="form-control"
                  placeholder="Enter contact number"
                />
                {memberContacts.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeMemberField(index)}
                    className="btn btn-danger"
                    style={{ minWidth: '80px' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addMemberField}
              className="btn btn-secondary"
              style={{ marginTop: '8px' }}
            >
              ➕ Add Another Member
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : '✨ Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
