import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ProcessingPage.module.css';

const ProcessingPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(fetchFileStatuses, 1000); // Polling every 5 seconds
    return () => clearInterval(interval); // Clean up the interval on unmount

    // Initial fetch
    fetchFileStatuses();

    async function fetchFileStatuses() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/files');
        setFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching file statuses:', error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/*<button onClick={() => navigate('/upload')} className="home-button">
          <div className="home-icon-circle">
            <i className="fa fa-arrow-circle-left home-icon"></i>
          </div>
        </button>*/}
        <button onClick={() => navigate('/')} className="home-button-proc">
          <div className="home-icon-circle-proc">
            <i className="fa fa-home home-icon-proc"></i>
          </div>
        </button>
      </div>
      <h1 className={styles.title}>Processing Page</h1>
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            Loading...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.filename}</td>
                  <td>
                    {file.status === 'processing' ? (
                      <div className={styles.status}>
                        Processing
                        <div className={styles.smallSpinner}></div>
                      </div>
                    ) : (
                      'Completed'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProcessingPage;
