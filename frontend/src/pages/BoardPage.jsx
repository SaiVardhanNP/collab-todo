import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Navbar from '/src/components/Navbar.jsx';
import TaskCard from '/src/components/TaskCard.jsx';
import TaskModal from '/src/components/TaskModal.jsx';
import ConflictModal from '/src/components/ConflictModal.jsx';
import ActivityLog from '/src/components/ActivityLog.jsx';
import { apiClient } from '/src/context/AuthContext.jsx';
import { socket } from '/src/services/socket.js';
import '/src/styles/board.css';

const BoardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictData, setConflictData] = useState(null);

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

  useEffect(() => {
    const handleTaskCreated = (newTask) => {
      setTasks(prevTasks => [...prevTasks, newTask]);
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    };

    const handleTaskDeleted = ({ id }) => {
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const taskToMove = tasks.find(t => t._id === draggableId);
    if (!taskToMove) return;

    try {
      await apiClient.put(`/tasks/${draggableId}`, {
        status: destination.droppableId,
        version: taskToMove.version,
      });
    } catch (error) {
      console.error("Failed to move task:", error);
      if (error.response && error.response.status === 409) {
        alert("Could not move task. It has been modified by someone else. The board will now refresh.");
      } else {
        alert("A network error occurred while moving the task.");
      }
      apiClient.get('/tasks').then(res => setTasks(res.data));
    }
  };

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
      const taskToSave = {
        ...taskData,
        version: selectedTask ? selectedTask.version : undefined,
      };
      if (taskToSave._id) {
        await apiClient.put(`/tasks/${taskToSave._id}`, taskToSave);
      } else {
        await apiClient.post('/tasks', taskToSave);
      }
      handleCloseModal();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setIsModalOpen(false);
        setConflictData({
          clientTask: taskData,
          serverTask: error.response.data.serverTask,
        });
        setIsConflictModalOpen(true);
      } else {
        console.error("Failed to save task", error);
        alert("Error: " + (error.response?.data?.msg || "Could not save task."));
      }
    }
  };

  const handleCloseConflictModal = () => {
    setIsConflictModalOpen(false);
    setConflictData(null);
  };

  const handleOverwrite = async (clientTask, latestVersion) => {
    try {
      await apiClient.put(`/tasks/${clientTask._id}`, {
        ...clientTask,
        version: latestVersion,
      });
      handleCloseConflictModal();
    } catch (error) {
      console.error("Failed to overwrite task", error);
      alert("Overwrite failed. Please try again.");
      handleCloseConflictModal();
    }
  };
  
  const handleSmartAssign = async (taskId) => {
    try {
      await apiClient.post(`/tasks/${taskId}/smart-assign`);
    } catch (error) {
      console.error("Failed to smart assign task", error);
      alert("Error: " + (error.response?.data?.msg || "Could not smart assign task."));
    }
  };

  const columns = {
    Todo: tasks.filter(task => task.status === 'Todo'),
    'In Progress': tasks.filter(task => task.status === 'In Progress'),
    Done: tasks.filter(task => task.status === 'Done'),
  };

  return (
    <div className="board-page-container">
      {isModalOpen && (
        <TaskModal 
          task={selectedTask} 
          onClose={handleCloseModal} 
          onSave={handleSaveTask}
          onSmartAssign={handleSmartAssign}
        />
      )}
      {isConflictModalOpen && (
        <ConflictModal
          clientTask={conflictData.clientTask}
          serverTask={conflictData.serverTask}
          onCancel={handleCloseConflictModal}
          onOverwrite={handleOverwrite}
        />
      )}
      <div className="board-layout">
        <div className="board-main-content">
          <header className="board-header">
            <h2>Project Board</h2>
            <button onClick={() => handleOpenModal()} className="add-task-btn">
              + Add Task
            </button>
          </header>
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
        <ActivityLog />
      </div>
    </div>
  );
};

export default BoardPage;