import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({ name: '', email: '', username: '', password: '', picture: '' });
  const [editMode, setEditMode] = useState(false);
  const [newPicture, setNewPicture] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`http://127.0.0.1:5000/api/user/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      const data = await response.json();
      setUserInfo(data.user);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    setIsChanged(true);
  };

  const handlePictureChange = (e) => {
    setNewPicture(e.target.files[0]);
    setIsChanged(true);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', userInfo.name);
    formData.append('email', userInfo.email);
    formData.append('username', userInfo.username);
    formData.append('password', userInfo.password);
    if (newPicture) {
      formData.append('picture', newPicture);
    }

    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`http://127.0.0.1:5000/api/user/${username}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update user info');
      }

      const data = await response.json();
      setUserInfo(data.user);
      setEditMode(false);
      setIsChanged(false);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const handleHomeClick = () => {
    navigate('/'); 
  };

  return (
    <div className="profile-page">
      <button className="home-button" onClick={handleHomeClick}>Home</button>
      <h1>Profile</h1>
      <div className="profile-picture">
        <img src={'https://www.w3schools.com/html/pic_trulli.jpg'} alt="Profile" />
        {editMode && <input type="file" onChange={handlePictureChange} />}
      </div>
      <div className="profile-info">
        <label>Name:</label>
        {editMode ? (
          <input type="text" name="name" value={userInfo.name} onChange={handleChange} />
        ) : (
          <p>{userInfo.name}</p>
        )}
        <label>Email:</label>
        {editMode ? (
          <input type="email" name="email" value={userInfo.email} onChange={handleChange} />
        ) : (
          <p>{userInfo.email}</p>
        )}
        <label>Username:</label>
        {editMode ? (
          <input type="text" name="username" value={userInfo.username} onChange={handleChange} />
        ) : (
          <p>{userInfo.username}</p>
        )}
        <label>Password:</label>
        {editMode ? (
          <input type="password" name="password" value={userInfo.password} onChange={handleChange} />
        ) : (
          <p>********</p>
        )}
        {editMode ? (
          <button className={isChanged ? 'save-button active' : 'save-button'} onClick={handleSave}>Save</button>
        ) : (
          <button onClick={() => setEditMode(true)}>Edit</button>
        )}
      </div>
    </div>
  );
};

export default Profile;
