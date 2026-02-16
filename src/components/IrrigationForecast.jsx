import React from 'react';
import { Calendar, Droplets, Thermometer, CloudRain, CheckCircle, Info, TrendingUp } from 'lucide-react';

export default function IrrigationForecast({ forecast }) {
    if (!forecast || !Array.isArray(forecast)) {
        return (
            <div className="forecast-section empty">
                <div className="empty-state">
                    <Info size={40} />
                    <p>No forecast data available for this farm yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="forecast-section">
            <div className="section-header">
                <div className="header-title-group">
                    <Calendar className="header-icon" />
                    <div className="header-text">
                        <h3>5-Day Smart Irrigation Plan</h3>
                        <p>AI-driven predictions based on weather & soil trends</p>
                    </div>
                </div>
                <div className="header-stats">
                    <TrendingUp size={16} />
                    <span>Next 5 Days</span>
                </div>
            </div>

            <div className="forecast-scroll-wrapper">
                <div className="forecast-grid-modern">
                    {forecast.map((day, index) => (
                        <div key={index} className={`forecast-card-premium ${day.decision ? 'action-irrigate' : 'action-none'}`}>
                            <div className="card-glass-overlay"></div>

                            <div className="forecast-date-pill">
                                <span className="day-name">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                <span className="day-date">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>

                            <div className="decision-visual">
                                {day.decision ? (
                                    <div className="decision-badge irrigate">
                                        <Droplets className="pulse-icon" size={18} />
                                        <span>Irrigate</span>
                                    </div>
                                ) : (
                                    <div className="decision-badge no-irrigate">
                                        <CheckCircle size={18} />
                                        <span>Optimal</span>
                                    </div>
                                )}
                                <div className="confidence-meter">
                                    <div className="confidence-value" style={{ width: `${day.confidence}%` }}></div>
                                    <span className="confidence-label">{day.confidence}% confidence</span>
                                </div>
                            </div>

                            <div className="forecast-details">
                                <div className="detail-item">
                                    <span className="label">Est. Soil</span>
                                    <div className="soil-progress">
                                        <div className="progress-bar" style={{ width: `${day.estimatedSoil}%` }}></div>
                                        <span className="progress-text">{day.estimatedSoil}%</span>
                                    </div>
                                </div>

                                <div className="metrics-row">
                                    <div className="mini-metric">
                                        <Thermometer size={14} />
                                        <span>{day.temperature}°C</span>
                                    </div>
                                    <div className="mini-metric">
                                        <CloudRain size={14} />
                                        <span>{day.rainfall}mm</span>
                                    </div>
                                </div>
                            </div>

                            <div className="advice-footer">
                                <p>{day.advice}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
