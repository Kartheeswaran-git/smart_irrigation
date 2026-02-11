import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase"; // rtdb is Realtime
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import SensorCard from "../components/SensorCard";
import PumpControl from "../components/PumpControl";
import Fertilizer from "../components/Fertilizer";
import WeatherWidget from "../components/WeatherWidget";

import { useAuth } from "../context/AuthContext";
import { Settings } from "lucide-react";

export default function Dashboard() {
  const { userData, logout } = useAuth();
  const [data, setData] = useState({
    soil: 0,
    temp: 0,
    humidity: 0,
    flow: 0,
    well: 0
  });
  const [irrigation, setIrrigation] = useState({
    pump: false,
    mode: 'manual',
    timer: { startTime: '06:00', duration: 30 }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData?.farmId) {
      setLoading(false);
      return;
    }

    // 1. Fetch Live Sensor Data from REALTIME DB
    const sensorRef = ref(rtdb, `farms/${userData.farmId}/liveData`);
    const unsubSensor = onValue(sensorRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setData(val);
      setLoading(false); // Set loading to false once we have sensor data (or even if null)
    });

    // 2. Fetch Irrigation Status from REALTIME DB
    const irrigationRef = ref(rtdb, `farms/${userData.farmId}/irrigation`);
    const unsubIrrigation = onValue(irrigationRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setIrrigation(val);
      }
    });

    return () => {
      unsubSensor();
      unsubIrrigation();
    };
  }, [userData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  if (!userData?.farmId && userData?.role !== 'admin') {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>No Farm Assigned</h2>
        <p>Please contact an administrator to get access to a farm.</p>
        <button onClick={handleLogout} className="logout-btn" style={{ marginTop: '20px', background: '#d32f2f' }}>
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-brand">
          <h1>Smart Irrigation</h1>
          <p>{userData?.farmId ? `Farm Monitor: ${userData.farmId}` : 'Dashboard'}</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          {/* Debug/Dev Button */}
          {userData?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="logout-btn" style={{ background: '#1a237e' }}>
              <Settings size={18} style={{ marginRight: '8px' }} /> Admin Panel
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <SensorCard title="Soil Moisture" value={data.soil} unit="%" />
        <SensorCard title="Temperature" value={data.temp} unit="°C" />
        <SensorCard title="Humidity" value={data.humidity} unit="%" />
        <SensorCard title="Water Flow" value={data.flow} unit="L/min" />
        <SensorCard title="Well Level" value={data.well} unit="cm" />
        <WeatherWidget />
      </div>

      <div className="controls-grid">
        <PumpControl irrigationData={irrigation} farmId={userData?.farmId} />
        <Fertilizer date="2026-02-15" />
      </div>
    </div>
  );
}
