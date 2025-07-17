import React from 'react';
import '/src/styles/conflict-modal.css'; // Absolute path

const ConflictModal = ({ clientTask, serverTask, onOverwrite, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content conflict-modal">
        <div className="modal-header">
          <h2>Conflict Detected</h2>
        </div>
        <p className="conflict-message">
          This task was updated by someone else while you were editing. Please choose which version to keep.
        </p>
        <div className="conflict-comparison">
          <div className="conflict-version">
            <h4>Your Version</h4>
            <div className="task-details">
              <strong>Title:</strong> {clientTask.title}
            </div>
            <div className="task-details">
              <strong>Description:</strong> {clientTask.description}
            </div>
            <div className="task-details">
              <strong>Priority:</strong> {clientTask.priority}
            </div>
          </div>
          <div className="conflict-version">
            <h4>Server's Version</h4>
            <div className="task-details">
              <strong>Title:</strong> {serverTask.title}
            </div>
            <div className="task-details">
              <strong>Description:</strong> {serverTask.description}
            </div>
            <div className="task-details">
              <strong>Priority:</strong> {serverTask.priority}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="conflict-cancel-btn">
            Cancel (Keep Server's Version)
          </button>
          <button onClick={() => onOverwrite(clientTask, serverTask.version)} className="conflict-overwrite-btn">
            Overwrite with My Version
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;