import React, { useState } from 'react';
import { ref, update } from "firebase/database";
import { rtdb } from "../firebase"; // rtdb is Realtime Database
import { Power, Settings, Clock, Droplets, Save, Activity } from 'lucide-react';

export default function PumpControl({ irrigationData, farmId }) {
  const { pump, mode = 'manual', timer = { startTime: '06:00', duration: 15 } } = irrigationData || {};
  const [editTimer, setEditTimer] = useState({ ...timer });

  const updateMode = async (newMode) => {
    if (!farmId) return;
    try {
      const irrigationRef = ref(rtdb, `farms/${farmId}/irrigation`);
      await update(irrigationRef, { mode: newMode });
    } catch (error) {
      console.error("Error updating mode:", error);
    }
  };

  const togglePump = async () => {
    if (mode !== 'manual' || !farmId) return;
    try {
      const irrigationRef = ref(rtdb, `farms/${farmId}/irrigation`);
      await update(irrigationRef, { pump: !pump });
    } catch (error) {
      console.error("Error toggling pump:", error);
    }
  };

  const handleTimerChange = (e) => {
    const { name, value } = e.target;
    setEditTimer(prev => ({ ...prev, [name]: value }));
  };

  const saveTimerSettings = async () => {
    if (!farmId) return;
    try {
      const irrigationRef = ref(rtdb, `farms/${farmId}/irrigation`);
      await update(irrigationRef, { timer: editTimer });
    } catch (error) {
      console.error("Error saving timer:", error);
    }
  };

  return (
    <div className="control-card pump-card">
      <div className="card-header">
        <h3>Irrigation Control</h3>
        <Settings size={20} className={mode === 'auto' ? "spin-icon" : ""} />
      </div>

      {/* Mode Selection Tabs */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => updateMode('manual')}
        >
          Manual
        </button>
        <button
          className={`mode-tab ${mode === 'auto' ? 'active' : ''}`}
          onClick={() => updateMode('auto')}
        >
          Auto (Sensor)
        </button>
        <button
          className={`mode-tab ${mode === 'timer' ? 'active' : ''}`}
          onClick={() => updateMode('timer')}
        >
          Timer
        </button>
      </div>

      <div className="control-body">
        {mode === 'manual' && (
          <div className="pump-action">
            <button
              onClick={togglePump}
              className={`pump-btn ${pump ? 'active' : 'inactive'}`}
            >
              <Power size={24} />
              {pump ? "PUMP ON" : "PUMP OFF"}
            </button>
            <p className="helper-text">Full manual control of the water pump.</p>
          </div>
        )}

        {mode === 'auto' && (
          <div className="auto-status">
            <Droplets size={48} className="status-icon" />
            <h4>Soil Moisture Mode</h4>
            <p>System automatically irrigates when moisture is low.</p>
            <div className={`status-badge ${pump ? 'on' : 'off'}`}>
              Pump is currently {pump ? 'ON' : 'OFF'}
            </div>
          </div>
        )}

        {mode === 'timer' && (
          <div className="timer-settings">
            <div className="input-group">
              <label><Clock size={16} /> Start Time</label>
              <input
                type="time"
                name="startTime"
                value={editTimer.startTime || ''}
                onChange={handleTimerChange}
              />
            </div>

            <div className="input-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                min="1"
                max="120"
                value={editTimer.duration || ''}
                onChange={handleTimerChange}
              />
            </div>

            <button className="save-btn" onClick={saveTimerSettings}>
              <Save size={16} /> Save Settings
            </button>

            <p className="helper-text">
              Pump will run daily at <strong>{editTimer.startTime}</strong> for <strong>{editTimer.duration} mins</strong>.
            </p>
          </div>
        )}

        {/* ML Advice Section (Always Visible if Data Exists) */}
        {(irrigationData?.advice || irrigationData?.mlDecision !== undefined) && (
          <div className="ml-advice-section">
            <div className="advice-header">
              <Activity size={18} />
              <h4>ML Recommendation</h4>
            </div>
            <div className={`advice-card ${irrigationData?.mlDecision ? 'on' : 'off'}`}>
              <div className="advice-main">
                <span className="advice-text">{irrigationData?.advice || (irrigationData?.mlDecision ? 'Pump ON' : 'Pump OFF')}</span>
                <span className="advice-confidence">{irrigationData?.confidence}% confidence</span>
              </div>
              <p className="advice-sub">Based on live sensor data and real-time weather.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
