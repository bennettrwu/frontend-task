import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import MultiSelectDropdown from './MultiSelectDropdown';
import SeverityTag from './SeverityTag';

const severity_map = {
  'Low': 0,
  'Medium': 1,
  'High': 2,
  'Critical': 3
}

const Dashboard = ({ setAuth }) => {
  const [alerts, setAlerts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();  // Initialize useNavigate hook
  const [showFilters, setShowFilters] = useState(false);

  const [filteredAlerts, setFilteredAlerts] = useState([]);

  const [timeFrom, setTimeFrom] = useState(-Infinity);
  const [timeTo, setTimeTo] = useState(Infinity);
  const [includeVaried, setIncludeVaried] = useState(true);

  const [machines, setMachines] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [sortKey, setSortKey] = useState('id');
  const [sortAcs, setSortAcs] = useState(true);

  useEffect(() => {
    fetchAlerts(); // Fetch alerts when component mounts
  }, []);

  const fetchAlerts = async () => {
    try {
      setAlerts([]);
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

  useEffect(() => {
    const filtered = alerts.filter((a) => {
      if (Date.parse(timeFrom) > Date.parse(a.occurred_on.replace(' ', 'T'))) return false;
      if (Date.parse(timeTo) < Date.parse(a.occurred_on.replace(' ', 'T'))) return false;
      if (a.occurred_on === 'Varied' && !includeVaried) return false;

      if (machines.length !== 0 && machines.indexOf(a.machine) === -1) return false;
      if (severity.length !== 0 && severity.indexOf(a.severity) === -1) return false;
      if (programs.length !== 0 && programs.indexOf(a.program) === -1) return false;

      return true
    }).sort((a, b) => {
      a = a[sortKey];
      b = b[sortKey];
      if (sortKey === 'severity') {
        a = severity_map[a];
        b = severity_map[b];
      }

      if (sortAcs) return a > b;
      else return a < b;
    })
    setFilteredAlerts(filtered);
  }, [alerts, timeFrom, timeTo, includeVaried, machines, severity, programs, sortKey, sortAcs]);

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

  const updateSort = (newKey) => {
    if (newKey === sortKey) setSortAcs(!sortAcs);
    setSortKey(newKey);
  }



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
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => handleLogout()}>
            Sign Out
          </button>
        </div>
      </div>

      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className='w-full p-2 '>
          <button className="ml-4 text-white text-lg" onClick={() => toggleMenu()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="user-info">
          <div className="user-photo"></div>
          <div className="user-name">{username}</div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <h1 className="title">Dashboard</h1>

        <div className='flex justify-between pr-10 pl-10'>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => fetchAlerts()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Refresh</span>
          </button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => setShowFilters(!showFilters)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>
        <div className={showFilters ? '' : 'overflow-hidden'} style={{ maxHeight: showFilters ? '10rem' : '0vh', transition: 'all 0.1s linear' }}>
          <div className='p-10 grid grid-cols-3'>
            <label>
              <span className='mr-2 font-bold'>From:</span><br />
              <input value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} id="datetime-start" type="datetime-local" class="" />
              <label for="datetime-start" class="hidden"></label>
            </label>
            <label>
              <span className='mr-2 font-bold'>To:</span><br />
              <input value={timeTo} onChange={(e) => setTimeTo(e.target.value)} id="datetime-end" type="datetime-local" class="" />
              <label for="datetime-end" class="hidden"></label>
            </label>
            <label>
              <span className='mr-2 font-bold'>Include Varied Timestamps:</span>
              <input defaultChecked={includeVaried} onChange={(e) => setIncludeVaried(!includeVaried)} id="include-varied" type="checkbox" class="" />
              <label for="include-varied" class="hidden"></label>
            </label>

            <div>
              <span className='mr-2 font-bold'>Machines:</span>
              <br />
              <MultiSelectDropdown
                options={[...new Set(alerts.map(a => a.machine))]}
                onChange={(selected) => setMachines(selected)}
                prompt='Select one or more'
              />
            </div>
            <div>
              <span className='mr-2 font-bold'>Severity:</span>
              <br />
              <MultiSelectDropdown
                options={[...new Set(alerts.map(a => a.severity))]}
                onChange={(selected) => setSeverity(selected)}
                prompt='Select one or more'
              />
            </div>
            <div>
              <span className='mr-2 font-bold'>Programs:</span>
              <br />
              <MultiSelectDropdown
                options={[...new Set(alerts.map(a => a.program))]}
                onChange={(selected) => setPrograms(selected)}
                prompt='Select one or more'
              />
            </div>
          </div>
        </div>

        {/* Conditional rendering based on alerts */}
        {alerts.length === 0 &&
          <div className="no-alerts">
            <p>To start, upload a CSV file with your log data.</p>
          </div>
        }

        {filteredAlerts.length > 0 ? (
          <div className="alerts-table p-10">
            <h2>Alerts</h2>
            <table>
              <thead>
                <tr>
                  <th className='hover:bg-gray-200' onClick={() => updateSort('id')}>
                    <div className='flex content-center'>
                      <span className={sortKey === 'id' ? !sortAcs ? 'rotate-180 transition-all' : 'transition-all' : 'transition-all text-gray-400'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                        </svg>
                      </span>
                      ID
                    </div>
                  </th>
                  <th className='hover:bg-gray-200' onClick={() => updateSort('name')}>
                    <div className='flex content-center'>
                      <span className={sortKey === 'name' ? !sortAcs ? 'rotate-180 transition-all' : 'transition-all' : 'transition-all text-gray-400'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                        </svg>
                      </span>
                      Name
                    </div>
                  </th>
                  <th className='hover:bg-gray-200' onClick={() => updateSort('description')}>
                    <div className='flex content-center'>
                      <span className={sortKey === 'description' ? !sortAcs ? 'rotate-180 transition-all' : 'transition-all' : 'transition-all text-gray-400'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                        </svg>
                      </span>
                      Description
                    </div>
                  </th>
                  <th className='hover:bg-gray-200' onClick={() => updateSort('severity')}>
                    <div className='flex content-center'>
                      <span className={sortKey === 'severity' ? !sortAcs ? 'rotate-180 transition-all' : 'transition-all' : 'transition-all text-gray-400'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                        </svg>
                      </span>
                      Severity
                    </div>
                  </th>
                  <th className='hover:bg-gray-200' onClick={() => updateSort('machine')}>
                    <div className='flex content-center'>
                      <span className={sortKey === 'machine' ? !sortAcs ? 'rotate-180 transition-all' : 'transition-all' : 'transition-all text-gray-400'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                        </svg>
                      </span>
                      Machine
                    </div>
                  </th>
                  <th className='hover:bg-gray-200' onClick={() => updateSort('program')}>
                    <div className='flex content-center'>
                      <span className={sortKey === 'program' ? !sortAcs ? 'rotate-180 transition-all' : 'transition-all' : 'transition-all text-gray-400'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                        </svg>
                      </span>
                      Program
                    </div>
                  </th>
                  <th className='hover:bg-gray-200' onClick={() => updateSort('occurred_on')}>
                    <div className='flex content-center'>
                      <span className={sortKey === 'occurred_on' ? !sortAcs ? 'rotate-180 transition-all' : 'transition-all' : 'transition-all text-gray-400'}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
                        </svg>
                      </span>
                      Timestamp
                    </div>
                  </th>
                  <th>More Info</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className='monofont'>{alert.id}</td>
                    <td className='monofont'>{alert.name}</td>
                    <td className='monofont'>{alert.description}</td>
                    <td className='monofont'><SeverityTag severity={alert.severity} /></td>
                    <td className='monofont'>{alert.machine}</td>
                    <td className='monofont'>{alert.program}</td>
                    <td className='monofont'>{alert.occurred_on}</td>
                    <td>
                      <Link to={`/alert/${alert.id}`}>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => setShowFilters(!showFilters)}>
                          More Info
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>

                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-alerts">
            <p>No alerts match filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
