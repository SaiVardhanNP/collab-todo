import React from 'react';
import '../styles/board.css';

const priorityColors = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

const TaskCard = ({ task }) => {
  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`priority-tag ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-card-footer">
        <span className="task-assignee">
          {task.assignedUser ? task.assignedUser.username : 'Unassigned'}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;