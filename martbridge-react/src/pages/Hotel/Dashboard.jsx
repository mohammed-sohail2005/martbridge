import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';
import { API_BASE_URL } from '../../apiConfig';

const HotelDashboard = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = usePopup();
    const { userId: hotelId, logout } = useAuth('hotelId', '/hotel/login');
    
    const [hotelData, setHotelData] = useState({ hotelName: 'Loading...', profileImage: 'profile.jpg' });
    const [labors, setLabors] = useState([]);
    const [showProfilePopup, setShowProfilePopup] = useState(false);

    useEffect(() => {
        if (hotelId) {
            fetchHotelData();
            fetchLabors();
        }
    }, [hotelId]);

    const fetchHotelData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/hotel/${hotelId}`);
            const data = await res.json();
            setHotelData(data);
        } catch (err) {
            console.error(err);
            showAlert('Failed to load hotel data', 'Error');
        }
    };

    const fetchLabors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/labor/owner/${hotelId}`);
            const data = await res.json();
            setLabors(data);
        } catch (err) {
            console.error("Labor fetch error:", err);
        }
    };



    const handleLogout = async () => {
        const confirmed = await showConfirm('Are you sure you want to logout?', 'Logout');
        if (confirmed) {
            logout();
            showAlert('Logged out successfully', 'Goodbye');
        }
    };

    const handleRequestAction = async (storeId, action) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/hotel/accept-link/${hotelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, action })
            });
            if (res.ok) {
                showAlert(`Request ${action} successfully`, 'Success');
                fetchHotelData();
            }
        } catch (err) {
            showAlert('Action failed', 'Error');
        }
    };

    const totalMonthlySalary = labors.reduce((sum, l) => sum + l.salary, 0);

    return (
        <div className="dashboard-page hotel">
            <div className="dashboard-header">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
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

            {hotelData.pendingRequests && hotelData.pendingRequests.length > 0 && (
                <div className="notifications-container">
                    {hotelData.pendingRequests.map(req => (
                        <div key={req.storeId} className="notification-card">
                            <div className="notif-info">
                                <strong>{req.storeName}</strong> ({req.storeType}) wants to connect.
                            </div>
                            <div className="notif-actions">
                                <button className="accept-btn" onClick={() => handleRequestAction(req.storeId, 'accepted')}>Agree</button>
                                <button className="reject-btn" onClick={() => handleRequestAction(req.storeId, 'rejected')}>Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="center-content" style={{ paddingTop: hotelData.pendingRequests?.length > 0 ? '40px' : '100px' }}>
                <h1>HOTEL DASHBOARD</h1>
                <h2>{hotelData.hotelName}</h2>
                <div className="linked-info">
                    <span>📍 {hotelData.location}</span>
                    <div className="badges-container">
                        {hotelData.departmentStoreId && <span className="store-badge">🏬 Department Store</span>}
                        {hotelData.meatStoreId && <span className="store-badge">🥩 Meat Store</span>}
                        {hotelData.vegetableStoreId && <span className="store-badge">🥦 Vegetable Store</span>}
                        {!hotelData.departmentStoreId && !hotelData.meatStoreId && !hotelData.vegetableStoreId && hotelData.linkedStoreName && (
                            <span className="store-badge">🔗 {hotelData.linkedStoreName} ({hotelData.storeType})</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="dash-sections">
                <div className="dash-card">
                    <h3>🧾 View Bills</h3>
                    <p>Track your orders and payments</p>
                    <div className="store-columns">
                        {(hotelData.departmentStoreId || hotelData.storeType === 'department') && <button onClick={() => navigate('/hotel/bills?store=department')}>Department</button>}
                        {(hotelData.meatStoreId || hotelData.storeType === 'meat') && <button onClick={() => navigate('/hotel/bills?store=meat')}>Meat</button>}
                        {(hotelData.vegetableStoreId || hotelData.storeType === 'vegetable') && <button onClick={() => navigate('/hotel/bills?store=vegetable')}>Vegetable</button>}
                        {!hotelData.departmentStoreId && !hotelData.meatStoreId && !hotelData.vegetableStoreId && !hotelData.storeType && <button onClick={() => navigate('/hotel/bills')}>View All</button>}
                    </div>
                </div>
                
                <div className="dash-card labor-card" onClick={() => navigate('/hotel/labor')}>
                    <h3>👷 Labor Card</h3>
                    <p>{labors.length} Laborers Registered</p>
                    <div className="summary-val">Total: ₹{totalMonthlySalary}</div>
                </div>

                <div className="dash-card">
                    <h3>🛒 Place Orders</h3>
                    <p>Order from linked shops</p>
                    <div className="store-columns">
                        {(hotelData.departmentStoreId || hotelData.storeType === 'department') && <button onClick={() => navigate('/hotel/place-order?store=department')}>Department</button>}
                        {(hotelData.meatStoreId || hotelData.storeType === 'meat') && <button onClick={() => navigate('/hotel/place-order?store=meat')}>Meat</button>}
                        {(hotelData.vegetableStoreId || hotelData.storeType === 'vegetable') && <button onClick={() => navigate('/hotel/place-order?store=vegetable')}>Vegetable</button>}
                        {!hotelData.departmentStoreId && !hotelData.meatStoreId && !hotelData.vegetableStoreId && !hotelData.storeType && <button onClick={() => navigate('/hotel/place-order')}>Order</button>}
                    </div>
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
                .dashboard-header { position: absolute; top: 0; left: 0; right: 0; padding: 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
                .profile-icon { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; cursor: pointer; border: 2px solid #00b050; transition: 0.3s; }
                .profile-icon:hover { transform: scale(1.1); }
                .logout-btn { padding: 10px 18px; border: none; border-radius: 20px; background: var(--danger-gradient); color: white; font-weight: 600; cursor: pointer; z-index: 999; box-shadow: 0 4px 15px rgba(255, 0, 0, 0.2); }
                .overlay-blur { position: fixed; inset: 0; backdrop-filter: blur(10px); background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 999; }
                .profile-popup { background: white; width: 320px; border-radius: 20px; padding: 30px 20px; text-align: center; position: relative; color: #222; }
                .popup-img { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid #00b050; margin-top: -90px; background: white; }
                .edit-btn { margin-top: 20px; width: 100%; padding: 12px; background: #00b050; color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer; }
                .close-btn { position: absolute; top: 15px; right: 18px; font-size: 20px; cursor: pointer; color: #666; }
                .center-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 100px 20px 20px; }
                .center-content h1 { font-size: 48px; margin-bottom: 10px; }
                .center-content h2 { color: #c8ffe4; margin-bottom: 20px; font-weight: 500; }
                .linked-info { display: flex; flex-direction: column; gap: 8px; font-size: 14px; opacity: 0.9; align-items: center; }
                .store-badge { background: rgba(0, 176, 80, 0.3); padding: 6px 14px; border-radius: 20px; border: 1px solid #00b050; margin-top: 5px; font-weight: 600; color: #fff; }
                .dash-sections { position: relative; z-index: 2; max-width: 1000px; margin: -40px auto 80px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; padding: 0 20px; width: 100%; }
                .dash-card { background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(14px); border-radius: 22px; padding: 28px; min-height: 160px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; transition: .3s; border: 1px solid rgba(255, 255, 255, 0.1); }
                .dash-card:hover { transform: translateY(-6px) scale(1.02); background: rgba(11, 177, 93, 0.25); }
                
                .store-columns { display: flex; gap: 10px; margin-top: 15px; width: 100%; justify-content: center; flex-wrap: wrap; }
                .store-columns button { flex: 1; min-width: 80px; padding: 8px 12px; border: none; border-radius: 8px; background: rgba(255,255,255,0.2); color: white; cursor: pointer; transition: 0.2s; font-weight: 600; font-size: 13px; }
                .store-columns button:hover { background: #00b050; }

                .labor-card { border: 1px solid rgba(255, 193, 7, 0.4); }
                .labor-card .summary-val { margin-top: 10px; font-weight: 800; color: #ffc107; font-size: 20px; }

                .notifications-container { position: relative; z-index: 10; max-width: 600px; margin: 80px auto 0; padding: 0 20px; }
                .notification-card { background: rgba(255, 255, 255, 0.95); color: #222; border-radius: 12px; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
                .notif-info { font-size: 14px; }
                .notif-actions { display: flex; gap: 10px; }
                .accept-btn { background: #00b050; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .reject-btn { background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; }

                .badges-container { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px; }



                @media (max-width: 768px) {
                    .center-content { padding-top: 80px; }
                    .center-content h1 { font-size: 26px; }
                    .center-content h2 { font-size: 16px; margin-bottom: 20px; }
                    .dash-sections { grid-template-columns: 1fr; margin-top: 20px; gap: 15px; margin-bottom: 40px; }
                    .dash-card { min-height: 120px; padding: 20px; }
                    .index-card h3 { font-size: 18px; }
                    .logout-btn { padding: 8px 14px; font-size: 11px; }
                    .dashboard-header { padding: 15px; }
                    .profile-popup { width: 92%; }
                }
            `}</style>
        </div>
    );
};

export default HotelDashboard;
