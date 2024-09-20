import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Graph from 'react-vis-network-graph';
import { Rnd } from 'react-rnd';
import './NetworkPage.css';
import uuid from "react-uuid";

const NetworkPage = () => {
  const { alertId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickedEdge, setClickedEdge] = useState(null);
  const [clickedNode, setClickedNode] = useState(null);
  const [showTransparent, setShowTransparent] = useState(false);

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

  const toggleTransparentEdges = () => {
    setShowTransparent(prevState => !prevState);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const formatFilePath = (filePath) => {
    const parts = filePath.split('\\');
    if (filePath.length > 12 && parts[0] !== 'comb-file') {
      return `${parts[0]}\\...`;
    }
    return filePath;
  };

  const filteredNodes = showTransparent ? nodes : nodes.filter(node =>
    edges.some(edge => (edge.source === node.id || edge.target === node.id) && !edge.transparent)
  );
  const filteredEdges = showTransparent ? edges : edges.filter(edge => !edge.transparent);

  const options = {
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
        title: node.type === 'file' ? node.label : '', // Full path shown on hover
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

  return (
    <div className="network-container">
      <button className="toggle-button" onClick={toggleTransparentEdges}>
        {showTransparent ? "Hide Transparent Edges" : "Show Transparent Edges"}
      </button>
      <div id="network-visualization">
        <Graph
          key={uuid()}
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
  );
};

export default NetworkPage;

