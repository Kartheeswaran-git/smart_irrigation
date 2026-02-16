import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_KEY = "6e6c72d4d47ff8f2a1d0c3a84aa6b356";
    const lat = 11.0168;
    const lon = 76.9558;

    useEffect(() => {
        async function fetchWeather() {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );
                const data = await response.json();

                if (data.cod === 200) {
                    setWeather({
                        temperature: data.main.temp,
                        windspeed: data.wind.speed * 3.6, // Convert m/s to km/h
                        icon: data.weather[0].icon,
                        description: data.weather[0].description,
                        name: data.name
                    });
                }
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

    const getWeatherIcon = (iconCode) => {
        if (iconCode.includes('01')) return <Sun size={40} className="weather-icon sunny" />;
        if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud size={40} className="weather-icon cloudy" />;
        if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain size={40} className="weather-icon rainy" />;
        return <Sun size={40} />;
    };

    return (
        <div className="weather-card">
            <div className="weather-header">
                <h3>{weather.name || 'Local Weather'}</h3>
                <span className="location-badge">Live</span>
            </div>

            <div className="weather-content">
                <div className="main-weather">
                    {getWeatherIcon(weather.icon)}
                    <div className="temp-display">
                        <span className="current-temp">{Math.round(weather.temperature)}°C</span>
                        <div className="weather-meta">
                            <span className="wind-speed"><Wind size={14} /> {weather.windspeed.toFixed(1)} km/h</span>
                        </div>
                    </div>
                </div>
                <p className="weather-desc" style={{ fontSize: '0.85rem', marginTop: '10px', textTransform: 'capitalize', opacity: 0.9 }}>
                    {weather.description}
                </p>
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
