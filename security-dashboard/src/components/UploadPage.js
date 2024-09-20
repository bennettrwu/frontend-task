import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setErrorMessage(''); // Clear any previous error message when a new file is selected
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        navigate('/processing');
      } else {
        const data = await response.json();
        if (data.error === 'This file has already been uploaded. Please try a different file.') {
          setErrorMessage(data.error);
        } else {
          setErrorMessage('Error uploading file.');
        }
      }
    } catch (error) {
      setErrorMessage('Error uploading file.');
    }
  };

  return (
    <div className="upload-page">
      <button onClick={() => navigate('/')} className="home-button-up">
        <div className="home-icon-circle-up">
          <i className="fa fa-home home-icon-up"></i>
        </div>
      </button>
      <h1 className="title">Upload CSV</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <input type="file" onChange={handleFileChange} className="file-input" />
      <button onClick={handleUpload} className="upload-button">Upload</button>
    </div>
  );
};

export default UploadPage;
