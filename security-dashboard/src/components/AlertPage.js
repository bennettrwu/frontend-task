import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Graph from 'react-vis-network-graph';
import { Rnd } from 'react-rnd';
import './AlertPage.css';
import { useNavigate, useParams } from 'react-router-dom';
import SeverityTag from './SeverityTag';

const AlertPage = () => {
  const { alertId } = useParams();
  const [alertData, setAlertData] = useState(null);
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickedEdge, setClickedEdge] = useState(null);
  const [clickedNode, setClickedNode] = useState(null);
  const [showTransparent, setShowTransparent] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const formatFilePath = (filePath) => {
    const parts = filePath.split('\\');
    if (filePath.length > 12 && parts[0] !== 'comb-file') {
      return `${parts[0]}\\...`;
    }
    return filePath;
  };

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


  useEffect(() => {
    setNodes([]);
    setEdges([]);
    setLoading(true);

    axios.get(`http://127.0.0.1:5000/api/network/${alertId}`)
      .then(response => {
        const { nodes, edges } = response.data;

        const sortedEdges = edges.sort((a, b) => new Date(a.time) - new Date(b.time));

        const nodesByRank = nodes.reduce((acc, node) => {
          const rank = node.rank || 0;
          if (!acc[rank]) acc[rank] = [];
          acc[rank].push(node);
          return acc;
        }, {});

        const nodePositions = {};
        const rankSpacingX = 200;
        const ySpacing = 100;

        Object.keys(nodesByRank).forEach(rank => {
          const nodesInRank = nodesByRank[rank];
          nodesInRank.sort((a, b) => {
            const aEdges = edges.filter(edge => edge.source === a.id || edge.target === a.id);
            const bEdges = edges.filter(edge => edge.source === b.id || edge.target === b.id);
            return aEdges.length - bEdges.length;
          });

          const totalNodesInRank = nodesInRank.length;
          nodesInRank.forEach((node, index) => {
            nodePositions[node.id] = {
              x: rank * rankSpacingX,
              y: index * ySpacing - (totalNodesInRank * ySpacing) / 2,
            };
          });
        });

        const positionedNodes = nodes.map(node => ({
          ...node,
          x: nodePositions[node.id].x,
          y: nodePositions[node.id].y,
        }));

        setNodes(positionedNodes);
        setEdges(sortedEdges);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching network data:', error);
        setLoading(false);
      });
  }, [alertId]);

  const handleNodeClick = (event) => {
    const { nodes: clickedNodes } = event;
    if (clickedNodes.length > 0) {
      const nodeId = clickedNodes[0];
      const clickedNode = nodes.find(node => node.id === nodeId);
      setClickedNode(clickedNode || null);
    }
  };

  const handleEdgeClick = (event) => {
    const { edges: clickedEdges } = event;
    if (clickedEdges.length > 0) {
      const edgeId = clickedEdges[0];
      const clickedEdge = edges.find(edge => `${edge.source}-${edge.target}` === edgeId);
      setClickedEdge(clickedEdge || null);
    }
  };

  const handleClosePopup = () => {
    setClickedEdge(null);
    setClickedNode(null);
  };

  const filteredNodes = showTransparent ? nodes : nodes.filter(node =>
    edges.some(edge => (edge.source === node.id || edge.target === node.id) && !edge.transparent)
  );
  const filteredEdges = showTransparent ? edges : edges.filter(edge => !edge.transparent);

  const options = {
    autoResize: true,
    layout: { hierarchical: false },
    edges: {
      color: { color: '#000000', highlight: '#ff0000', hover: '#ff0000' },
      arrows: { to: { enabled: true, scaleFactor: 1 } },
      smooth: { type: 'cubicBezier', roundness: 0.2 },
      font: { align: 'top', size: 12 },
    },
    nodes: {
      shape: 'dot',
      size: 20,
      font: { size: 14, face: 'Arial' },
    },
    interaction: {
      dragNodes: true,
      hover: true,
      selectConnectedEdges: false,
    },
    physics: {
      enabled: false,
      stabilization: { enabled: true, iterations: 300, updateInterval: 50 },
    },
  };

  const graphData = {
    nodes: filteredNodes.map(node => {
      let label = node.label;

      // Apply the file path shortening for file nodes
      if (node.type === 'file' && node.label !== 'comb-file') {
        label = formatFilePath(node.label);
      }

      return {
        id: node.id,
        label: label,
        title: node.type === 'file' ? node.label : undefined, // Full path shown on hover
        x: node.x,
        y: node.y,
        shape: node.type === 'process' ? 'circle' :
          node.type === 'socket' ? 'diamond' :
            'box', // File node is represented as a box
        size: node.type === 'socket' ? 40 : 20,
        font: { size: node.type === 'socket' ? 10 : 14, vadjust: node.type === 'socket' ? -50 : 0 },
        color: {
          background: node.transparent ? "rgba(151, 194, 252, 0.5)" : "rgb(151, 194, 252)", // Light blue with 50% opacity if transparent, otherwise default color
          border: "#2B7CE9", // Border color remains the same
          highlight: { background: node.transparent ? "rgba(210, 229, 255, 0.1)" : "#D2E5FF", border: "#2B7CE9" }, // Light highlight color with 50% opacity if transparent, otherwise default highlight color
        },
        className: node.transparent && !showTransparent ? 'transparent' : '',
      };
    }),

    edges: filteredEdges.map(edge => ({
      from: edge.source,
      to: edge.target,
      label: edge.label,
      color: edge.alname && edge.transparent ? '#ff9999' : // Light red for both alname and transparent
        edge.alname ? '#ff0000' :                  // Bright red for alname only
          edge.transparent ? '#d3d3d3' :             // Light gray for transparent only
            '#000000',                                // Black for neither
      id: `${edge.source}-${edge.target}`,
      font: { size: 12, align: 'horizontal', background: 'white', strokeWidth: 0 },
      className: edge.transparent && !showTransparent ? 'transparent' : '',
    })),
  };
  if (!alertData) return <div>Loading...</div>;

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div className="w-full">
        <div className='p-10 w-full shadow'>
          <div className='flex justify-between content-center h-10'>
            <div className='flex content-center'>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => navigate('/')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                <span>Return to Dashboard</span>
              </button>

              <p className='font-bold text-4xl ml-4'>{alertData.name}</p>
            </div>

            <div className='flex content-center'>
              {(edges.some(e => e.transparent) || nodes.some(n => n.transparent)) && <div className='font-bold py-2 px-4 rounded mr-4 inline-flex items-center'>
                <span className='mr-2'>Show Hidden Edges:</span>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input value={showTransparent} onChange={evt => setShowTransparent(!showTransparent)} id="switch-2" type="checkbox" class="peer sr-only" />
                  <label for="switch-2" class="hidden"></label>
                  <div class="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-focus:ring-blue-500"></div>
                </label>
              </div>
              }

              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4 inline-flex items-center" onClick={() => setPanelOpen(!panelOpen)}>
                <span className={panelOpen ? 'rotate-180 transition-transform' : 'transition-transform'}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {panelOpen && <div className='h-64'>
            <h1>More Info</h1>
            <table className='table-auto'>
              <thead>
                <tr>
                  <td className="border px-4 py-2 font-bold">ID</td>
                  <td className="border px-4 py-2 font-bold">Name</td>
                  <td className="border px-4 py-2 font-bold">Description</td>
                  <td className="border px-4 py-2 font-bold">Severity</td>
                  <td className="border px-4 py-2 font-bold">Machine</td>
                  <td className="border px-4 py-2 font-bold">Program</td>
                  <td className="border px-4 py-2 font-bold">Timestamp</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 monofont">{alertData.id}</td>
                  <td className="border px-4 py-2 monofont">{alertData.name}</td>
                  <td className="border px-4 py-2 monofont">{alertData.description}</td>
                  <td className="border px-4 py-2 monofont"><SeverityTag severity={alertData.severity} /></td>
                  <td className="border px-4 py-2 monofont">{alertData.machine}</td>
                  <td className="border px-4 py-2 monofont">{alertData.program}</td>
                  <td className="border px-4 py-2 monofont">{alertData.occurred_on}</td>
                </tr>
              </tbody>
            </table>
          </div>}
        </div>
      </div>

      <div className="network-container" style={{
        height: panelOpen ? `calc(100vh - 25.5rem)` : 'calc(100vh - 7.5rem)',
        top: panelOpen ? '25.5rem' : '7.5rem'
      }}>
        <div id="network-visualization">
          <Graph
            key={showTransparent}
            graph={graphData}
            options={options}
            events={{
              selectNode: handleNodeClick,
              selectEdge: handleEdgeClick
            }}
          />
          {clickedEdge && clickedEdge.alname && (
            <Rnd default={{ x: 50, y: 50, width: 250, height: 150 }} bounds="parent">
              <div className="popup popup-edge">
                <button className="close-button" onClick={handleClosePopup}>X</button>
                <p>Alert: {clickedEdge.alname}</p>
              </div>
            </Rnd>
          )}
          {clickedNode && clickedNode.nodes && (
            <Rnd default={{ x: 150, y: 150, width: 300, height: 200 }} bounds="parent">
              <div className="popup popup-node scrollable-popup">
                <button className="close-button" onClick={handleClosePopup}>X</button>
                <p>Names:</p>
                {clickedNode.nodes.map((name, index) => (
                  <p key={index}>{name}</p>
                ))}
              </div>
            </Rnd>
          )}
        </div>
      </div>
    </div >);
};

export default AlertPage;
