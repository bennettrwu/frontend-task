import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setAuth(true);
          localStorage.setItem('username', data.username);
          localStorage.setItem('auth', 'true');
          navigate('/');
        } else {
          setError('Invalid username or password');
        }
      });
  };

  return (
    <div className="login-page">
      <h1 className="title">Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="login-button">Login</button>
      </form>

      <p>
        <u>Don't have an account? </u>
        <br></br>
        <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded inline-flex items-center" onClick={() => navigate('/create-user')}>Create One</button>
      </p>
    </div>
  );
};

export default LoginPage;
