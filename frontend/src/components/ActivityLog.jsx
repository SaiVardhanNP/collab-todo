import React, { useState, useEffect } from 'react';
import { apiClient } from '../context/AuthContext';
import { socket } from '../services/socket';
import '../styles/activity-log.css';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiClient.get('/logs');
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    const handleNewLog = (newLog) => {
      setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 19)]);
    };

    socket.on('action:logged', handleNewLog);

    return () => {
      socket.off('action:logged', handleNewLog);
    };
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
  };

  return (
    <aside className="activity-log-panel">
      <h3>Activity</h3>
      <ul className="log-list">
        {logs.map(log => (
          <li key={log._id} className="log-item">
            <span className="log-user">{log.user?.username || 'A user'}</span>
            <span className="log-action">{log.action}</span>
            <span className="log-time">{formatTimestamp(log.timestamp)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ActivityLog;