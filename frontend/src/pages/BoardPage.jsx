import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard'; 
import { apiClient } from '../context/AuthContext';
import '../styles/board.css';

const BoardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []); 

  const columns = {
    Todo: tasks.filter(task => task.status === 'Todo'),
    'In Progress': tasks.filter(task => task.status === 'In Progress'),
    Done: tasks.filter(task => task.status === 'Done'),
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ padding: '2rem' }}>Loading board...</p>
      </>
    );
  }

  return (
    <div className="board-page-container">
      <Navbar />
      <main className="board-container">
        {Object.entries(columns).map(([status, tasksInColumn]) => (
          <div key={status} className="board-column">
            <h2 className="column-title">{status}</h2>
            <div className="column-tasks">
              {tasksInColumn.map(task => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default BoardPage;