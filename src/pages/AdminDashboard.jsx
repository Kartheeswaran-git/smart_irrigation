import React, { useEffect, useState } from 'react';
import { db, rtdb } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Sprout, Tractor, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react'; // Added Trash2

export default function AdminDashboard() {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState({});
    const [farms, setFarms] = useState({});
    const [loading, setLoading] = useState(true);
    const [newFarmName, setNewFarmName] = useState('');

    // User Creation State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [creatingUser, setCreatingUser] = useState(false);
    const [creationError, setCreationError] = useState('');

    useEffect(() => {
        // Basic role check
        if (!userData || userData.role !== 'admin') {
            navigate('/');
            return;
        }

        // Fetch Users (Firestore)
        const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersData = {};
            snapshot.forEach(doc => {
                usersData[doc.id] = doc.data();
            });
            setUsers(usersData);
        });

        // Fetch Farms (Firestore)
        const unsubFarms = onSnapshot(collection(db, "farms"), (snapshot) => {
            const farmsData = {};
            snapshot.forEach(doc => {
                farmsData[doc.id] = { id: doc.id, ...doc.data() };
            });
            setFarms(farmsData);
            setLoading(false);
        });

        return () => {
            unsubUsers();
            unsubFarms();
        };
    }, [userData, navigate]);

    const registerUser = async () => {
        if (!newUserEmail || !newUserPassword) {
            setCreationError('Please provide email and password.');
            return;
        }
        setCreatingUser(true);
        setCreationError('');

        try {
            // DYNAMICALLY IMPORT FIREBASE TO CREATE SECOND APP
            const { initializeApp } = await import("firebase/app");
            const { getAuth, createUserWithEmailAndPassword, signOut: secondarySignOut } = await import("firebase/auth");

            // Hardcode config or import it. For now, let's reuse the config from firebase.js if possible, 
            // but we can't easily import the config OBJECT from there unless we export it.
            // I'll just use the known config values here to be safe and quick.
            const secondaryApp = initializeApp({
                apiKey: "AIzaSyBwVqinePgkAcCiGOoYt5SEOgHyVyprXyc",
                authDomain: "smart-agri-af9b0.firebaseapp.com",
                projectId: "smart-agri-af9b0",
                storageBucket: "smart-agri-af9b0.firebasestorage.app",
                messagingSenderId: "1072695872191",
                appId: "1:1072695872191:web:da38edf9cf166dea83140a"
            }, "SecondaryApp");

            const secondaryAuth = getAuth(secondaryApp);
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUserEmail, newUserPassword);
            const newUser = userCredential.user;

            // Create User Document in FIRESTORE
            await setDoc(doc(db, "users", newUser.uid), {
                email: newUserEmail,
                role: 'farmer',
                farmId: '', // No farm assigned yet
                createdAt: new Date(),
                uid: newUser.uid
            });

            // Clean up secondary auth
            await secondarySignOut(secondaryAuth);

            // Reset form
            setNewUserEmail('');
            setNewUserPassword('');
            alert(`User ${newUserEmail} created successfully!`);

        } catch (error) {
            console.error("Error creating user:", error);
            setCreationError(error.message);
        } finally {
            setCreatingUser(false);
        }
    };

    const createFarm = async () => {
        if (!newFarmName.trim()) return;

        try {
            // 1. Create Farm Metadata in Firestore
            const farmRef = await addDoc(collection(db, "farms"), {
                name: newFarmName,
                createdAt: new Date(),
                // Store irrigation settings in Firestore as requested
                irrigation: {
                    mode: 'manual',
                    pump: false,
                    timer: { startTime: '06:00', duration: 30 }
                }
            });

            const newFarmId = farmRef.id;

            // 2. Initialize Realtime DB for SENSORS only
            await set(ref(rtdb, `farms/${newFarmId}/liveData`), {
                soil: 0,
                temp: 0,
                humidity: 0,
                flow: 0,
                well: 0
            });

            setNewFarmName('');
            alert('Farm created successfully!');
        } catch (error) {
            console.error("Error creating farm:", error);
            alert('Failed to create farm: ' + error.message);
        }
    };

    const updateUserRole = async (uid, newRole) => {
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const assignFarm = async (uid, farmId) => {
        try {
            await updateDoc(doc(db, "users", uid), { farmId: farmId });
        } catch (error) {
            console.error("Error assigning farm:", error);
        }
    };

    const deleteUser = async (uid) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteDoc(doc(db, "users", uid));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user.");
            }
        }
    };

    const deleteFarm = async (farmId) => {
        if (window.confirm('Are you sure you want to delete this farm?')) {
            try {
                await deleteDoc(doc(db, "farms", farmId));
                // Optional: Delete from Realtime DB too if needed
                // set(ref(rtdb, `farms/${farmId}`), null);
            } catch (error) {
                console.error("Error deleting farm:", error);
                alert("Failed to delete farm.");
            }
        }
    };

    if (loading) return <div className="loading-screen">Loading Admin Panel...</div>;

    // Safety check: Don't render if not authorized (useEffect will redirect, but prevent flash)
    if (!userData || userData.role !== 'admin') {
        return null;
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Control Panel</h1>
                <button onClick={() => navigate('/')} className="back-btn">Exit to Dashboard</button>
            </header>

            <div className="admin-grid">
                {/* User Creation Section */}
                <section className="admin-card">
                    <div className="card-header-admin">
                        <h2><Users size={24} /> Register New Farmer</h2>
                    </div>
                    <div className="create-user-form">
                        <input
                            type="email"
                            placeholder="New Farmer Email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                        />
                        <button onClick={registerUser} disabled={creatingUser}>
                            {creatingUser ? 'Creating...' : 'Register User'}
                        </button>
                    </div>
                    {creationError && <p className="error-text" style={{ color: 'red', marginTop: '10px' }}>{creationError}</p>}
                    <p className="helper-text" style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
                        * This will create a new account in the system with "Farmer" role.
                    </p>
                </section>

                {/* Farm Management Section */}
                <section className="admin-card">
                    <div className="card-header-admin">
                        <h2><Tractor size={24} /> Farm Management</h2>
                    </div>
                    <div className="create-farm-form">
                        <input
                            type="text"
                            placeholder="New Farm Name (e.g., Green Valley)"
                            value={newFarmName}
                            onChange={(e) => setNewFarmName(e.target.value)}
                        />
                        <button onClick={createFarm}><Sprout size={16} /> Create Farm</button>
                    </div>

                    <div className="farm-list">
                        <h3>Active Farms ({Object.keys(farms).length})</h3>
                        <ul>
                            {Object.entries(farms).map(([id, farm]) => (
                                <li key={id} className="farm-item">
                                    <div className="farm-info">
                                        <span className="farm-name">{farm.name || 'Unnamed Farm'}</span>
                                        <span className="farm-id">ID: {id}</span>
                                    </div>
                                    <button onClick={() => deleteFarm(id)} className="delete-btn" title="Delete Farm">
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* User Management Section */}
                <section className="admin-card">
                    <div className="card-header-admin">
                        <h2><Users size={24} /> User Access Control</h2>
                    </div>
                    <div className="user-list">
                        {Object.entries(users).map(([uid, user]) => (
                            <div key={uid} className="user-row">
                                <div className="user-info">
                                    <span className="user-email">{user.email || uid}</span>
                                    <span className={`role-badge ${user.role}`}>{user.role || 'farmer'}</span>
                                </div>

                                <div className="user-actions">
                                    <select
                                        value={user.role || 'farmer'}
                                        onChange={(e) => updateUserRole(uid, e.target.value)}
                                        className="role-select"
                                    >
                                        <option value="farmer">Farmer</option>
                                        <option value="admin">Admin</option>
                                    </select>

                                    <select
                                        value={user.farmId || ''}
                                        onChange={(e) => assignFarm(uid, e.target.value)}
                                        className="farm-select"
                                    >
                                        <option value="">Select Farm...</option>
                                        {Object.entries(farms).map(([fid, farm]) => (
                                            <option key={fid} value={fid}>{farm.name || fid}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => deleteUser(uid)} className="delete-btn" title="Delete User">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {Object.keys(users).length === 0 && <p className="no-data">No users found.</p>}
                    </div>
                </section>
            </div>

            <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: var(--primary-green);
          color: white;
          padding: 20px;
          border-radius: 12px;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }
        .admin-card {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card-header-admin {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: var(--primary-green);
          border-bottom: 2px solid #e8eaf6;
          padding-bottom: 10px;
        }
        .create-farm-form, .create-user-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .create-farm-form input, .create-user-form input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .create-farm-form button, .create-user-form button {
          background: var(--primary-green);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .farm-list ul {
          list-style: none;
          padding: 0;
        }
        .farm-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: #f5f5f5;
          margin-bottom: 8px;
          border-radius: 6px;
        }
        .user-row {
          display: flex;
          flex-direction: column;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 10px;
          gap: 10px;
        }
        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .role-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .role-badge.admin { background: #e8eaf6; color: var(--primary-green); }
        .role-badge.farmer { background: #e8f5e9; color: var(--light-green); }
        
        .user-actions {
          display: flex;
          gap: 10px;
        }
        .role-select, .farm-select {
          flex: 1;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .back-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}
