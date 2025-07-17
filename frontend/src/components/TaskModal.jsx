import React, { useState } from 'react';
import '/src/styles/modal.css'; // Absolute path

const TaskModal = ({ task, onClose, onSave, onSmartAssign }) => {
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [priority, setPriority] = useState(task ? task.priority : 'Medium');

 // In src/components/TaskModal.jsx

const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...task, title, description, priority });
  };

  const handleSmartAssignClick = () => {
    if (task && task._id) {
      onSmartAssign(task._id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4"></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit" className="modal-save-btn">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
            {task && (
              <button type="button" className="modal-smart-btn" onClick={handleSmartAssignClick}>
                Smart Assign
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;