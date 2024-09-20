import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AlertPage = () => {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/alert/${alertId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setAlertData(data))
      .catch(error => console.error('There was a problem with the fetch operation:', error));
  }, [alertId]);

  if (!alertData) return <div>Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Alert {alertId}</h1>
      <table className="table-auto w-full">
        <tbody>
          <tr>
            <td className="border px-4 py-2 font-bold">ID</td>
            <td className="border px-4 py-2">{alertData.id}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Name</td>
            <td className="border px-4 py-2">{alertData.name}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Description</td>
            <td className="border px-4 py-2">{alertData.description}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Machine</td>
            <td className="border px-4 py-2">{alertData.machine}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Occurred On</td>
            <td className="border px-4 py-2">{alertData.occurred_on}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Severity</td>
            <td className="border px-4 py-2">{alertData.severity}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Program</td>
            <td className="border px-4 py-2">{alertData.program}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">View Graph</td>
            <td className="border px-4 py-2">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => navigate(`/network/${alertId}`)}
              >
                View Graph
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AlertPage;
