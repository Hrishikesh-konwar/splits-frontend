import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import GroupDetail from './components/GroupDetail';
import { isTokenExpired, getUserFromToken } from './utils/auth';
import { setupAxiosInterceptors } from './utils/api';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const handleTokenExpired = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Set up axios interceptors
    setupAxiosInterceptors(handleTokenExpired);

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        // Token is expired, clear it
        handleTokenExpired();
      } else {
        setToken(storedToken);
        setUser(getUserFromToken(storedToken));
      }
    }
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(getUserFromToken(newToken));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/auth" 
            element={
              token ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              token ? (
                <Dashboard 
                  token={token} 
                  user={user}
                  onLogout={handleLogout} 
                  onTokenExpired={handleTokenExpired}
                />
              ) : <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/group/:groupId" 
            element={
              token ? (
                <GroupDetail 
                  token={token} 
                  user={user}
                  onLogout={handleLogout}
                  onTokenExpired={handleTokenExpired}
                />
              ) : <Navigate to="/auth" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
