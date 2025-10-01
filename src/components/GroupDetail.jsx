import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import AddExpenseModal from './AddExpenseModal';
import AddMemberModal from './AddMemberModal';

const GroupDetail = ({ user, onLogout, onTokenExpired }) => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [completedSettlements, setCompletedSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchGroupData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(''); // Clear any previous errors
      }
      
      // Fetch group details and expenses in parallel
      const [groupResponse, expensesResponse] = await Promise.all([
        api.get(`/api/get-group-by-id?groupId=${groupId}`),
        api.get(`/api/get-expenses?groupId=${groupId}`)
      ]);
      
      // Set group data with proper ID mapping
      const groupData = groupResponse.data.group;
      const mappedGroup = {
        ...groupData,
        id: groupData._id, // Map _id to id for frontend consistency
        members: groupData.members.map(member => ({
          ...member,
          id: member._id || member.id, // Ensure each member has an id field
          _id: undefined // Remove _id to avoid confusion
        }))
      };
      
      setGroup(mappedGroup);
      setExpenses(expensesResponse.data.expenses || []);
      setSettlements(expensesResponse.data.balance || []);
      setCompletedSettlements(expensesResponse.data.settlements || []);
      
    } catch (err) {
      if (err.response?.status === 401) {
        onTokenExpired();
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch group data');
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [groupId, onTokenExpired]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleAddExpense = async (expenseData) => {
    try {
      await api.post('/api/add-expense', {
        ...expenseData,
        groupId
      });
      // Refresh data without page reload
      await fetchGroupData(true);
      setSuccessMessage('Expense added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowAddExpense(false);
    } catch (err) {
      if (err.response?.status === 401) {
        onTokenExpired();
        return;
      }
      throw new Error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      await api.post('/api/add-member', {
        groupId,
        memberContact: memberData.contact,
        memberName: memberData.name
      });
      // Refresh data without page reload
      await fetchGroupData(true);
      setSuccessMessage('Member added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowAddMember(false);
    } catch (err) {
      if (err.response?.status === 401) {
        onTokenExpired();
        return;
      }
      throw new Error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleSettlement = async (settlement) => {
    try {
      // Find the member details for from and to
      const fromMember = group.members.find(m => m.name === settlement.from);
      const toMember = group.members.find(m => m.name === settlement.to);
      
      if (!fromMember || !toMember) {
        setError('Could not find member details for settlement');
        return;
      }

      await api.post('/api/add-settlement', {
        groupId,
        from: fromMember.contact,
        to: toMember.contact,
        amount: settlement.amount,
        fromName: settlement.from,
        toName: settlement.to
      });
      
      // Refresh data without page reload
      await fetchGroupData(true);
      setSuccessMessage('Settlement recorded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err.response?.status === 401) {
        onTokenExpired();
        return;
      }
      setError(err.response?.data?.message || 'Failed to record settlement');
    }
  };

  const handleRemoveMember = async (memberContact) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await api.post('/api/remove-member', {
          groupId,
          memberContact
        });
        // Refresh data without page reload
        await fetchGroupData(true);
        setSuccessMessage('Member removed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        if (err.response?.status === 401) {
          onTokenExpired();
          return;
        }
        setError(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (!group) {
    return <div className="loading">Group not found</div>;
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
        <Link to="/" className="btn btn-secondary back-btn">← Back to Groups</Link>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>👥 {group.groupName}</h2>
              <p style={{ color: '#666', margin: 0 }}>
                {group.members.length} members • {expenses.length} expenses
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => fetchGroupData(true)} 
                className="btn btn-secondary"
                disabled={refreshing}
              >
                {refreshing ? '🔄' : '🔄'} Refresh
              </button>
              <button 
                onClick={() => setShowAddMember(true)} 
                className="btn btn-secondary"
              >
                👤 Add Member
              </button>
              <button 
                onClick={() => setShowAddExpense(true)} 
                className="btn btn-primary"
              >
                💰 Add Expense
              </button>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              💳 Expenses
            </button>
            <button 
              className={`tab ${activeTab === 'settlements' ? 'active' : ''}`}
              onClick={() => setActiveTab('settlements')}
            >
              💸 Settlements
            </button>
            <button 
              className={`tab ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              👥 Members
            </button>
          </div>

          {activeTab === 'expenses' && (
            <div className="expense-list">
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 style={{ color: '#666', marginBottom: '16px' }}>No expenses yet</h3>
                  <p style={{ color: '#999', marginBottom: '24px' }}>
                    Add your first expense to start tracking!
                  </p>
                  <button 
                    onClick={() => setShowAddExpense(true)} 
                    className="btn btn-primary"
                  >
                    Add First Expense
                  </button>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div key={expense.id} className="expense-item">
                    <div className="expense-header">
                      <div className="expense-description">📝 {expense.description}</div>
                      <div className="expense-amount">₹{expense.amount}</div>
                    </div>
                    <div className="expense-details">
                      Paid by <strong>{expense.paidBy.name}</strong> • Split between {expense.sharedby.map(u => u.name).join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settlements' && (
            <div className="settlement-list">
              {/* Pending Settlements */}
              {settlements.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '16px', color: '#333' }}>💸 Pending Settlements</h4>
                  {settlements.map((settlement, index) => {
                    const person = Object.keys(settlement)[0];
                    const payments = settlement[person];
                    
                    return (
                      <div key={index} className="settlement-item">
                        <div className="settlement-person">
                          <strong>{person}</strong> owes:
                        </div>
                        {payments.map((payment, paymentIndex) => (
                          <div key={paymentIndex} className="settlement-payment" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>→ ₹{payment.amount} to <strong>{payment.to}</strong></span>
                            <button 
                              onClick={() => handleSettlement({ from: person, to: payment.to, amount: payment.amount })}
                              className="btn btn-primary"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              Mark as Settled
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completed Settlements */}
              {completedSettlements.length > 0 && (
                <div style={{ marginTop: settlements.length > 0 ? '32px' : '0' }}>
                  <h4 style={{ marginBottom: '16px', color: '#333' }}>✅ Completed Settlements</h4>
                  {completedSettlements.map((settlement, index) => (
                    <div key={index} className="settlement-item" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                      <div className="settlement-payment">
                        ✅ <strong>{settlement.fromName}</strong> paid ₹{settlement.amount} to <strong>{settlement.toName}</strong>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Settled on {new Date(settlement.settledAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All settled message */}
              {settlements.length === 0 && completedSettlements.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 style={{ color: '#666', marginBottom: '16px' }}>All settled up! 🎉</h3>
                  <p style={{ color: '#999' }}>
                    No pending settlements. Everyone is even!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="member-list">
              {group.members.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 style={{ color: '#666', marginBottom: '16px' }}>No members yet</h3>
                  <p style={{ color: '#999', marginBottom: '24px' }}>
                    Add members to start splitting expenses!
                  </p>
                  <button 
                    onClick={() => setShowAddMember(true)} 
                    className="btn btn-primary"
                  >
                    Add First Member
                  </button>
                </div>
              ) : (
                group.members.map((member) => (
                  <div key={member.id} className="member-item">
                    <div>
                      <strong>👤 {member.name}</strong>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        📱 {member.contact}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(member.contact)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showAddExpense && (
        <AddExpenseModal
          group={group}
          onClose={() => setShowAddExpense(false)}
          onSubmit={handleAddExpense}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          group={group}
          onClose={() => setShowAddMember(false)}
          onSubmit={handleAddMember}
        />
      )}
    </div>
  );
};

export default GroupDetail;
