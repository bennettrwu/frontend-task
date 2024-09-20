import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateUserPage.css';

const CreateUserPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateUser = (event) => {
    event.preventDefault();

    const userData = {
      username,
      password,
      email,
      name,
    };

    fetch('http://127.0.0.1:5000/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          navigate('/login');
        } else {
          setError('Failed to create user');
        }
      })
      .catch(() => {
        setError('Failed to create user');
      });
  };

  return (
    <div className="create-user-page">
      <h1 className="title">Create User</h1>
      <form onSubmit={handleCreateUser}>
      <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}
        <button type="submit" className="create-button">Create</button>
      </form>
    </div>
  );
};

export default CreateUserPage;
