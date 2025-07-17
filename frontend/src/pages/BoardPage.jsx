// ... (imports and other functions remain the same) ...
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { apiClient } from '../context/AuthContext';
import { socket } from '../services/socket';
import '../styles/board.css';

const BoardPage = () => {
  // ... (all state and useEffect hooks remain the same) ...
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/tasks');
        setTasks(res.data);
      } catch (err) { console.error("Failed to fetch tasks", err); }
      finally { setLoading(false); }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleTaskCreated = (newTask) => setTasks(prev => [...prev, newTask]);
    const handleTaskUpdated = (updatedTask) => setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    const handleTaskDeleted = ({ id }) => setTasks(prev => prev.filter(t => t._id !== id));
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, []);

  const handleOpenModal = (task = null) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData._id) {
        await apiClient.put(`/tasks/${taskData._id}`, taskData);
      } else {
        await apiClient.post('/tasks', taskData);
      }
    } catch (error) {
      console.error("Failed to save task", error);
      alert("Error: " + (error.response?.data?.msg || "Could not save task."));
    }
  };
  
  // New handler function for Smart Assign
  const handleSmartAssign = async (taskId) => {
    try {
      await apiClient.post(`/tasks/${taskId}/smart-assign`);
    } catch (error) {
      console.error("Failed to smart assign task", error);
      alert("Error: " + (error.response?.data?.msg || "Could not smart assign task."));
    }
  };

  // ... (onDragEnd and columns logic remain the same) ...
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    const task = tasks.find(t => t._id === draggableId);
    if (task.status !== destination.droppableId) {
      const updatedTasks = tasks.map(t =>
        t._id === draggableId ? { ...t, status: destination.droppableId } : t
      );
      setTasks(updatedTasks);
      apiClient.put(`/tasks/${draggableId}`, { status: destination.droppableId })
        .catch(err => {
          console.error("Failed to update task status", err);
          setTasks(tasks);
        });
    }
  };

  const columns = {
    Todo: tasks.filter(task => task.status === 'Todo'),
    'In Progress': tasks.filter(task => task.status === 'In Progress'),
    Done: tasks.filter(task => task.status === 'Done'),
  };

  return (
    <div className="board-page-container">
      <Navbar />
      {isModalOpen && (
        <TaskModal 
          task={selectedTask} 
          onClose={handleCloseModal} 
          onSave={handleSaveTask}
          onSmartAssign={handleSmartAssign} // Pass the new handler down
        />
      )}
      <header className="board-header">
        <h2>Project Board</h2>
        <button onClick={() => handleOpenModal()} className="add-task-btn">
          + Add Task
        </button>
      </header>
      {/* ... (DragDropContext and mapping logic remains the same) ... */}
      <DragDropContext onDragEnd={onDragEnd}>
        <main className="board-container">
          {loading ? <p>Loading...</p> : Object.entries(columns).map(([status, tasksInColumn]) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`board-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  <h2 className="column-title">{status}</h2>
                  <div className="column-tasks">
                    {tasksInColumn.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card-wrapper ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            onClick={() => handleOpenModal(task)}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </main>
      </DragDropContext>
    </div>
  );
};

export default BoardPage;