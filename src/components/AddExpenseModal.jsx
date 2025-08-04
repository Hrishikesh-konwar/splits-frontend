import React, { useState } from 'react';

const AddExpenseModal = ({ group, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    paidBy: '',
    sharedBy: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSharedByChange = (memberId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        sharedBy: [...formData.sharedBy, memberId]
      });
    } else {
      setFormData({
        ...formData,
        sharedBy: formData.sharedBy.filter(id => id !== memberId)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.paidBy) {
        throw new Error('Please select who paid');
      }
      if (formData.sharedBy.length === 0) {
        throw new Error('Please select who shared the expense');
      }

      const paidByMember = group.members.find(m => m.id === formData.paidBy);
      const sharedByMembers = group.members.filter(m => formData.sharedBy.includes(m.id));

      await onSubmit({
        amount: parseFloat(formData.amount),
        description: formData.description,
        paidBy: paidByMember,
        sharedby: sharedByMembers
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
          <h3>💰 Add Expense</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Dinner at restaurant, Uber ride, Movie tickets"
              required
            />
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-control"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Paid by</label>
            <select
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select who paid</option>
              {group.members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Split between</label>
            <div className="checkbox-group">
              {group.members.map(member => (
                <div key={member.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={formData.sharedBy.includes(member.id)}
                    onChange={(e) => handleSharedByChange(member.id, e.target.checked)}
                  />
                  <label htmlFor={`member-${member.id}`}>{member.name}</label>
                </div>
              ))}
            </div>
            {formData.sharedBy.length > 0 && (
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                Each person owes: ₹{formData.amount ? (parseFloat(formData.amount) / formData.sharedBy.length).toFixed(2) : '0.00'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Adding...' : '💰 Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
