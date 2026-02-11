import React from 'react';
import { Droplets, Thermometer, Wind, Activity, Layers, AlertCircle } from 'lucide-react';

export default function SensorCard({ title, value, unit, type }) {
  // Determine icon based on type or title
  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'soil moisture': return <Layers size={32} />;
      case 'temperature': return <Thermometer size={32} />;
      case 'humidity': return <Droplets size={32} />;
      case 'water flow': return <Wind size={32} />; // Flow usually wind/air or specific pipe icon
      case 'well level': return <Activity size={32} />;
      default: return <Activity size={32} />;
    }
  };

  // Determine status color
  const getStatusColor = () => {
    // This logic should ideally be dynamic based on thresholds
    // For now, let's assume some basic ranges or pass a 'status' prop
    // Example logic:
    if (title.toLowerCase() === 'soil moisture') {
      if (value < 30) return 'status-critical'; // Dry
      if (value > 80) return 'status-warning';  // Wet
      return 'status-normal';
    }
    return 'status-normal';
  };

  const statusClass = getStatusColor();

  return (
    <div className={`sensor-card ${statusClass}`}>
      <div className="sensor-icon-wrapper">
        {getIcon()}
      </div>
      <div className="sensor-info">
        <span className="sensor-title">{title}</span>
        <div className="sensor-value-group">
          <span className="sensor-value">{value}</span>
          <span className="sensor-unit">{unit}</span>
        </div>
      </div>
      {statusClass === 'status-critical' && <AlertCircle size={20} className="alert-icon" />}
    </div>
  );
}
