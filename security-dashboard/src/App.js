import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UploadPage from './components/UploadPage';
import ProcessingPage from './components/ProcessingPage';
import AlertPage from './components/AlertPage';
import NetworkPage from './components/NetworkPage';
import LoginPage from './components/LoginPage';
import CreateUserPage from './components/CreateUserPage';
import Profile from './components/Profile'

import '@fortawesome/fontawesome-free/css/all.min.css';


const App = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    // Function to reset 'auth' to false on npm restart
    const resetAuthOnRestart = () => {
      localStorage.setItem('auth', 'false');
      setAuth(false); // Ensure state reflects the change
    };

    
    // Check if 'auth' is already set to true in localStorage
    const isAuthenticated = localStorage.getItem('auth') === 'true';
    setAuth(isAuthenticated);

    // Check and reset 'auth' to false on component mount
    if (!isAuthenticated) {
      resetAuthOnRestart();
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={auth ? <Navigate to="/" /> : <LoginPage setAuth={setAuth} />} />
        <Route path="/create-user" element={<CreateUserPage />} />
        <Route path="/upload" element={auth ? <UploadPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={auth ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/processing" element={auth ? <ProcessingPage /> : <Navigate to="/login" />} />
        <Route path="/alert/:alertId" element={auth ? <AlertPage /> : <Navigate to="/login" />} />
        <Route path="/network/:alertId" element={auth ? <NetworkPage /> : <Navigate to="/login" />} />
        <Route path="/" element={auth ? <Dashboard setAuth={setAuth}/> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
