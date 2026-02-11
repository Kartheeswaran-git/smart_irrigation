import React from 'react';
import { Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Fertilizer({ date }) {
  const isOverdue = new Date(date) < new Date();

  return (
    <div className={`control-card fertilizer-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="card-header">
        <h3>Fertilizer Schedule</h3>
        <Calendar size={20} />
      </div>

      <div className="fertilizer-content">
        <div className="date-display">
          <span className="label">Next Application</span>
          <h2 className="date">{date}</h2>
        </div>

        <div className="status-indicator">
          {isOverdue ? (
            <div className="status-badge warning">
              <AlertTriangle size={16} /> Overdue
            </div>
          ) : (
            <div className="status-badge success">
              <CheckCircle size={16} /> On Track
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
