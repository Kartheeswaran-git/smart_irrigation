import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    // Default to a farming location (e.g., Punjab, India or California, USA)
    // latitude=30.37&longitude=76.77 (Chandigarh)
    useEffect(() => {
        async function fetchWeather() {
            try {
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=30.37&longitude=76.77&current_weather=true'
                );
                const data = await response.json();
                setWeather(data.current_weather);
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, []);

    if (loading) return <div className="weather-card loading">Loading Weather...</div>;
    if (!weather) return <div className="weather-card error">Weather Unavailable</div>;

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes
        if (code <= 3) return <Sun size={40} className="weather-icon sunny" />;
        if (code <= 69) return <CloudRain size={40} className="weather-icon rainy" />;
        if (code <= 99) return <Cloud size={40} className="weather-icon cloudy" />;
        return <Sun size={40} />;
    };

    return (
        <div className="weather-card">
            <div className="weather-header">
                <h3>Local Weather</h3>
                <span className="location-badge">Live</span>
            </div>

            <div className="weather-content">
                <div className="main-weather">
                    {getWeatherIcon(weather.weathercode)}
                    <div className="temp-display">
                        <span className="current-temp">{weather.temperature}°C</span>
                        <span className="wind-speed"><Wind size={16} /> {weather.windspeed} km/h</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add styles locally or ensure they are in index.css
// I will expect index.css to handle general card styles, but specific ones here:
/*
.weather-card {
  background: linear-gradient(to bottom right, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 20px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
*/
