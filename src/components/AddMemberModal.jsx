import React, { useState } from 'react';

const AddMemberModal = ({ group, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Please enter member name');
      }
      if (!formData.contact.trim()) {
        throw new Error('Please enter member contact');
      }

      // Check if member already exists in group
      const memberExists = group.members.some(
        member => member.contact.toString() === formData.contact.trim()
      );

      if (memberExists) {
        throw new Error('This member is already in the group');
      }

      await onSubmit({
        name: formData.name.trim(),
        contact: formData.contact.trim()
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
          <h3>👥 Add Member</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter member's name"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter member's contact number"
              required
            />
          </div>

          <div style={{ fontSize: '14px', color: '#666', marginTop: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            💡 <strong>Note:</strong> If this contact number is registered in Splits, they'll be automatically added. 
            Otherwise, they'll be added as a placeholder and can login later with this number and password(same as number).
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Adding...' : '👥 Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
