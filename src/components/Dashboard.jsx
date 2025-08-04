import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import CreateGroupModal from './CreateGroupModal';

const Dashboard = ({ user, onLogout, onTokenExpired }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.get('/api/get-groups');
      setGroups(response.data.groups);
    } catch (err) {
      if (err.response?.status === 401) {
        onTokenExpired();
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, [onTokenExpired]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async (groupData) => {
    try {
      await api.post('/api/create-group', groupData);
      fetchGroups(); // Refresh the groups list
      setShowCreateModal(false);
    } catch (err) {
      if (err.response?.status === 401) {
        onTokenExpired();
        return;
      }
      throw new Error(err.response?.data?.message || 'Failed to create group');
    }
  };

  if (loading) {
    return <div className="loading">Loading your groups...</div>;
  }

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <h1>💰 Splits</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user && (
              <span style={{ color: '#ffffff', fontSize: '14px' }}>
                Welcome, <strong>{user.name}</strong>
              </span>
            )}
            <button onClick={onLogout} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Your Groups</h2>
              <p style={{ color: '#666', margin: 0 }}>Manage your shared expenses</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="btn btn-primary"
            >
              ➕ Create Group
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3 style={{ color: '#666', marginBottom: '16px' }}>No groups yet</h3>
              <p style={{ color: '#999', marginBottom: '24px' }}>
                Create your first group to start splitting expenses with friends!
              </p>
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="btn btn-primary"
              >
                Create Your First Group
              </button>
            </div>
          ) : (
            <div className="group-list">
              {groups.map((group) => (
                <Link 
                  key={group._id} 
                  to={`/group/${group.id}`} 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="group-card">
                    <h3>👥 {group.groupName}</h3>
                    <div className="group-members">
                      <strong>{group.members.length}</strong> members: {group.members.map(m => m.name).join(', ')}
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '14px', color: '#999' }}>
                      {group.expenses?.length || 0} expenses
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default Dashboard;
