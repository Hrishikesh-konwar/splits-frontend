import React, { useState } from 'react';
import axios from 'axios';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      contact: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin 
        ? { contact: formData.contact, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);
      
      if (response.data.token) {
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        {!isLogin && (
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your full name"
              required={!isLogin}
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="number"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your contact number"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading} style={{width: '100%'}}>
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
        
        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={toggleMode}>
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
