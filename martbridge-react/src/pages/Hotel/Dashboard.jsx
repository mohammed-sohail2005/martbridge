import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';

const HotelDashboard = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = usePopup();
    const { userId: hotelId, logout } = useAuth('hotelId', '/hotel/login');
    
    const [hotelData, setHotelData] = useState({ hotelName: 'Loading...', profileImage: 'profile.jpg' });
    const [shops, setShops] = useState({ vegetables: [], meat: [], department: [] });
    const [showProfilePopup, setShowProfilePopup] = useState(false);

    useEffect(() => {
        if (hotelId) {
            fetchHotelData();
            fetchLinkedShops();
        }
    }, [hotelId]);

    const fetchHotelData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/hotel/${hotelId}`);
            const data = await res.json();
            setHotelData(data);
        } catch (err) {
            console.error(err);
            showAlert('Failed to load hotel data', 'Error');
        }
    };

    const fetchLinkedShops = async () => {
        try {
            // In the original app, it seems to fetch shops linked to this hotel
            // This endpoint might vary based on your backend implementation
            const res = await fetch(`http://localhost:5000/api/hotel/${hotelId}/shops`);
            const data = await res.json();
            setShops(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        const confirmed = await showConfirm('Are you sure you want to logout?', 'Logout');
        if (confirmed) {
            logout();
            showAlert('Logged out successfully', 'Goodbye');
        }
    };

    return (
        <div className="dashboard-page hotel">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>

            <div className="topbar">
                <img 
                    src={hotelData.profileImage || 'profile.jpg'} 
                    className="profile-icon" 
                    onClick={() => setShowProfilePopup(true)} 
                    alt="profile"
                />
            </div>

            {showProfilePopup && (
                <div className="overlay-blur" onClick={() => setShowProfilePopup(false)}>
                    <div className="profile-popup" onClick={e => e.stopPropagation()}>
                        <img src={hotelData.profileImage || 'profile.jpg'} className="popup-img" alt="profile" />
                        <h2>{hotelData.hotelName}</h2>
                        <button className="edit-btn" onClick={() => navigate('/hotel/profile')}>Edit Profile</button>
                        <span className="close-btn" onClick={() => setShowProfilePopup(false)}>✕</span>
                    </div>
                </div>
            )}

            <div className="main-overlay"></div>

            <div className="center-content">
                <h1>HOTEL DASHBOARD</h1>
                <h2>{hotelData.hotelName}</h2>
                <div className="linked-info">
                    <span>📍 {hotelData.location}</span>
                    {hotelData.linkedStoreName && (
                        <span className="store-badge">🔗 {hotelData.linkedStoreName} ({hotelData.storeType})</span>
                    )}
                </div>
            </div>

            <div className="dash-sections">
                <div className="dash-card" onClick={() => navigate('/hotel/bills')}>
                    <h3>🧾 View Bills</h3>
                    <p>Track your orders and payments</p>
                </div>
                {/* Additional cards for ordering if applicable */}
                <div className="dash-card" onClick={() => navigate('/hotel/place-order')}>
                    <h3>🛒 Place Orders</h3>
                    <p>Order from linked shops</p>
                </div>
            </div>

            <style jsx="true">{`
                .dashboard-page.hotel {
                    min-height: 100vh;
                    background: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4') no-repeat center/cover;
                    position: relative;
                    color: white;
                    display: flex;
                    flex-direction: column;
                }
                .main-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); z-index: 0; }
                .topbar { position: fixed; top: 15px; right: 20px; z-index: 10; }
                .profile-icon { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; cursor: pointer; border: 2px solid #00b050; }
                .logout-btn { position: fixed; top: 20px; left: 20px; padding: 10px 18px; border: none; border-radius: 20px; background: var(--danger-gradient); color: white; font-weight: 600; cursor: pointer; z-index: 999; }
                .overlay-blur { position: fixed; inset: 0; backdrop-filter: blur(10px); background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 999; }
                .profile-popup { background: white; width: 320px; border-radius: 20px; padding: 30px 20px; text-align: center; position: relative; color: #222; }
                .popup-img { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid #00b050; margin-top: -90px; background: white; }
                .edit-btn { margin-top: 20px; width: 100%; padding: 12px; background: #00b050; color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer; }
                .close-btn { position: absolute; top: 15px; right: 18px; font-size: 20px; cursor: pointer; color: #666; }
                .center-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px; }
                .center-content h1 { font-size: 48px; margin-bottom: 10px; }
                .center-content h2 { color: #c8ffe4; margin-bottom: 20px; font-weight: 500; }
                .linked-info { display: flex; flex-direction: column; gap: 8px; font-size: 14px; opacity: 0.9; align-items: center; }
                .store-badge { background: rgba(0, 176, 80, 0.3); padding: 6px 14px; border-radius: 20px; border: 1px solid #00b050; margin-top: 5px; font-weight: 600; color: #fff; }
                .dash-sections { position: relative; z-index: 2; max-width: 1000px; margin: -40px auto 80px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; padding: 0 20px; width: 100%; }
                .dash-card { background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(14px); border-radius: 22px; padding: 28px; min-height: 160px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; transition: .3s; border: 1px solid rgba(255, 255, 255, 0.1); }
                .dash-card:hover { transform: translateY(-6px) scale(1.02); background: rgba(11, 177, 93, 0.25); }

                @media (max-width: 768px) {
                    .center-content h1 { font-size: 28px; }
                    .center-content h2 { font-size: 18px; }
                    .dash-sections { grid-template-columns: 1fr; margin-top: 20px; gap: 15px; margin-bottom: 40px; }
                    .dash-card { min-height: 120px; padding: 20px; }
                    .dash-card h3 { font-size: 18px; }
                    .dash-card p { font-size: 13px; }
                    .logout-btn { top: 15px; left: 15px; padding: 8px 14px; font-size: 11px; }
                }
            `}</style>
        </div>
    );
};

export default HotelDashboard;
