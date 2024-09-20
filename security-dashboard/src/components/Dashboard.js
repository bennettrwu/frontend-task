import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Dashboard.css';

const Dashboard = ({ setAuth }) => {
  const [alerts, setAlerts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();  // Initialize useNavigate hook

  useEffect(() => {
    fetchAlerts(); // Fetch alerts when component mounts
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/alert'); // Replace with your backend endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      setAlerts(data.alerts); // Assuming backend sends { alerts: [] }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Handle error (show message, retry logic, etc.)
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    // Implement logout logic here (clear localStorage, etc.)
    setAuth(false);
    localStorage.setItem('auth', 'false'); // Example: Reset auth state
    navigate('/login');  // Redirect to login page
    // Redirect user to login page or perform other logout actions
  };

  return (
    <div className={`dashboard ${menuOpen ? 'menu-open' : ''}`}>
      {/* Top bar with menu toggle and sign out */}
      <div className="top-bar">
        <div className="left-section">
          <div className="menu-toggle" onClick={toggleMenu}>
            <div className="triangle triangle-left"></div> 
            <div className="menu-icon">
              <div className="menu-line"></div>
              <div className="menu-line"></div>
              <div className="menu-line"></div>
            </div>
          </div>
        </div>
        <div className="middle-section"></div>
        <div className="right-section">
          <div className="sign-out" onClick={handleLogout}>
            Sign Out
          </div>
        </div>
      </div>

      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="user-info">
          <div className="user-photo"></div>
          <div className="user-name">{username}</div>
        </div>
        <div className="collapse-arrow-container" onClick={toggleMenu}>
          <div className="triangle triangle-left"></div> 
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <h1 className="title">Dashboard</h1>

        {/* Conditional rendering based on alerts */}
        {alerts.length > 0 ? (
          <div className="alerts-table">
            <h2>Alerts</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>More Info</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.id}</td>
                    <td>{alert.name}</td>
                    <td>{alert.description}</td>
                    <td>
                      <Link to={`/alert/${alert.id}`}>More Info</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-alerts">
            <p>To start, upload a CSV file with your log data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
