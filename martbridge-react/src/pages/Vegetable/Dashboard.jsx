import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';

const VegetableDashboard = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = usePopup();
    const { userId: vegId, logout } = useAuth('vegId', '/vegetable/register');
    
    const [storeData, setStoreData] = useState({
        storeName: 'Loading...',
        profileImage: 'profile.jpg'
    });
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [showInvitePopup, setShowInvitePopup] = useState(false);
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [inviteHotelName, setInviteHotelName] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [incomingOrders, setIncomingOrders] = useState([]);
    const [linkedHotels, setLinkedHotels] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [hotelsLoading, setHotelsLoading] = useState(false);

    useEffect(() => {
        if (vegId) {
            fetchStoreData();
            fetchIncomingOrders();
            fetchLinkedHotels();
        }
    }, [vegId]);

    const fetchStoreData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/vegetable/${vegId}`);
            const data = await res.json();
            setStoreData(data);
        } catch (err) {
            console.error(err);
            showAlert('Server error while loading dashboard', 'Error');
        }
    };

    const fetchIncomingOrders = async () => {
        setOrdersLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`http://localhost:5000/api/store/incoming-orders/${vegId}?date=${today}`);
            const data = await res.json();
            setIncomingOrders(data);
        } catch (err) {
            console.error("Order fetch error:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchLinkedHotels = async () => {
        setHotelsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/store/linked-hotels/${vegId}`);
            const data = await res.json();
            setLinkedHotels(data);
        } catch (err) {
            console.error("Hotels fetch error:", err);
        } finally {
            setHotelsLoading(false);
        }
    };

    const handleLogout = async () => {
        const confirmed = await showConfirm('Are you sure you want to logout?', 'Logout');
        if (confirmed) {
            logout();
            showAlert('Logged out successfully', 'Goodbye');
        }
    };

    const handleSendInvite = async () => {
        if (!inviteHotelName) {
            showAlert('Please enter hotel name', 'Missing Info');
            return;
        }

        setInviteLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/store/invite-hotel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hotelName: inviteHotelName, storeId: vegId, storeType: "vegetable" })
            });

            if (res.ok) {
                const baseUrl = window.location.origin;
                const link = `${baseUrl}/hotel/register?storeId=${vegId}&storeType=vegetable&hotelName=${encodeURIComponent(inviteHotelName)}`;
                setGeneratedLink(link);
                setShowInvitePopup(false);
                setShowLinkPopup(true);
                setInviteHotelName('');
            } else {
                showAlert('Failed to generate invite', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Failed to generate invite', 'Error');
        } finally {
            setInviteLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink).then(() => {
            showAlert('Link copied to clipboard! ✅', 'Copied');
        });
    };

    return (
        <div className="dashboard-page">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>

            {/* Top Profile */}
            <div className="topbar">
                <img 
                    src={storeData.profileImage || 'profile.jpg'} 
                    className="profile-icon" 
                    onClick={() => setShowProfilePopup(true)} 
                    alt="profile"
                />
            </div>

            {/* Profile Popup */}
            {showProfilePopup && (
                <div className="overlay-blur" onClick={() => setShowProfilePopup(false)}>
                    <div className="profile-popup" onClick={e => e.stopPropagation()}>
                        <img src={storeData.profileImage || 'profile.jpg'} className="popup-img" alt="profile" />
                        <h2>{storeData.storeName}</h2>
                        <button className="edit-btn" onClick={() => navigate('/vegetable/profile')}>Edit Profile</button>
                        <span className="close-btn" onClick={() => setShowProfilePopup(false)}>✕</span>
                    </div>
                </div>
            )}

            <div className="main-overlay"></div>

            {/* Invite Hotel Popup */}
            {showInvitePopup && (
                <div className="overlay-blur" onClick={() => setShowInvitePopup(false)}>
                    <div className="invite-card" onClick={e => e.stopPropagation()}>
                        <h2>✨ Invite Hotel</h2>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>Send an invitation to connect automatically.</p>

                        <div className="input-group">
                            <input 
                                type="text" 
                                value={inviteHotelName} 
                                onChange={e => setInviteHotelName(e.target.value)} 
                                placeholder=" " 
                                required
                            />
                            <label>Hotel Name</label>
                        </div>

                        <button className="invite-btn" onClick={handleSendInvite} disabled={inviteLoading}>
                            {inviteLoading ? 'Sending...' : 'Send Invitation 🚀'}
                        </button>
                        <span className="close-btn" onClick={() => setShowInvitePopup(false)}>✕</span>
                    </div>
                </div>
            )}

            {/* Link Popup */}
            {showLinkPopup && (
                <div className="overlay-blur" style={{ zIndex: 10001 }} onClick={() => setShowLinkPopup(false)}>
                    <div className="invite-card" onClick={e => e.stopPropagation()}>
                        <h2>🔗 Invitation Link</h2>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>Share this link with the hotel owner.</p>

                        <div className="input-group">
                            <input type="text" value={generatedLink} readOnly style={{ color: '#0bb15d', fontWeight: 'bold' }} />
                            <label>Registration Link</label>
                        </div>

                        <button className="invite-btn" onClick={copyToClipboard}>Copy Link 📋</button>
                        <span className="close-btn" onClick={() => setShowLinkPopup(false)}>✕</span>
                    </div>
                </div>
            )}

            <div className="center-content">
                <h1>VEGETABLE STORE</h1>
                <h2>{storeData.storeName}</h2>
                <button className="add-hotel" onClick={() => setShowInvitePopup(true)}>+ ADD HOTEL</button>
            </div>

            <div className="dash-sections">
                <div className="dash-card" onClick={() => navigate('/vegetable/set-prices')}>
                    <h3>🥦 Set Today's Prices</h3>
                    <p>Update daily vegetable rates</p>
                </div>

                <div className="dash-card" onClick={() => navigate('/vegetable/orders')}>
                    <h3>📥 Incoming Orders ({incomingOrders.length})</h3>
                    <p>Orders from connected hotels</p>
                </div>

                <div className="dash-card" onClick={() => navigate('/vegetable/hotels')}>
                    <h3>🏨 Connected Hotels ({linkedHotels.length})</h3>
                    <p>View all hotels linked to your store</p>
                </div>

                <div className="dash-card" onClick={() => navigate('/vegetable/payments')}>
                    <h3>💳 View Payments</h3>
                    <p>Confirm incoming payments</p>
                </div>
            </div>

            <style jsx="true">{`
                .dashboard-page {
                    min-height: 100vh;
                    background: url('https://images.unsplash.com/photo-1542838132-92c53300491e') no-repeat center/cover;
                    position: relative;
                    color: white;
                    display: flex;
                    flex-direction: column;
                }

                .main-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 0;
                }

                .topbar {
                    position: fixed;
                    top: 15px;
                    right: 20px;
                    z-index: 10;
                }

                .profile-icon {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    object-fit: cover;
                    cursor: pointer;
                    border: 2px solid #00b050;
                }

                .logout-btn {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    padding: 10px 18px;
                    border: none;
                    border-radius: 20px;
                    background: var(--danger-gradient);
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 20px rgba(255, 0, 0, 0.3);
                    z-index: 999;
                }

                .overlay-blur {
                    position: fixed;
                    inset: 0;
                    backdrop-filter: blur(10px);
                    background: rgba(0, 0, 0, 0.4);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 999;
                }

                .profile-popup, .invite-card {
                    background: white;
                    width: 320px;
                    border-radius: 20px;
                    padding: 30px 20px;
                    text-align: center;
                    position: relative;
                    color: #222;
                }

                .invite-card { width: 380px; }

                .popup-img {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid #00b050;
                    margin-top: -90px;
                    background: white;
                }

                .edit-btn {
                    margin-top: 20px;
                    width: 100%;
                    padding: 12px;
                    background: #00b050;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    cursor: pointer;
                }

                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 18px;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                }

                .center-content {
                    position: relative;
                    z-index: 1;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 20px;
                }

                .center-content h1 { font-size: 48px; margin-bottom: 10px; }
                .center-content h2 { color: #c8ffe4; margin-bottom: 30px; font-weight: 500; }

                .add-hotel {
                    padding: 18px 50px;
                    font-size: 20px;
                    font-weight: 700;
                    border: none;
                    border-radius: 50px;
                    background: #0bb15d;
                    color: white;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                    transition: 0.3s;
                }

                .dash-sections {
                    position: relative;
                    z-index: 2;
                    max-width: 1000px;
                    margin: 40px auto 80px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 24px;
                    padding: 0 20px;
                    width: 100%;
                }

                .dash-card {
                    background: rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(14px);
                    border-radius: 22px;
                    padding: 28px;
                    min-height: 160px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    cursor: pointer;
                    transition: .3s;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .dash-card:hover {
                    transform: translateY(-6px) scale(1.02);
                    background: rgba(11, 177, 93, 0.25);
                }

                .dash-card h3 { margin-bottom: 10px; font-size: 20px; }
                .dash-card p { font-size: 14px; opacity: 0.8; }

                .input-group {
                    position: relative;
                    margin-bottom: 20px;
                    text-align: left;
                }

                .input-group input {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    outline: none;
                    font-size: 15px;
                    transition: 0.3s;
                    background: #f9f9f9;
                }

                .input-group label {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #888;
                    transition: 0.3s;
                    pointer-events: none;
                    background: transparent;
                    padding: 0 4px;
                    font-size: 14px;
                }

                .input-group input:focus + label,
                .input-group input:not(:placeholder-shown) + label {
                    top: 0;
                    font-size: 12px;
                    color: #00b050;
                    background: white;
                    font-weight: 600;
                }

                .invite-btn {
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: 30px;
                    background: linear-gradient(135deg, #00b050, #008a3e);
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 20px rgba(0, 176, 80, 0.3);
                    transition: 0.3s;
                }

                @media (max-width: 768px) {
                    .center-content h1 { font-size: 30px; }
                    .center-content h2 { font-size: 18px; }
                    .add-hotel { padding: 14px 30px; font-size: 16px; }
                    .dash-sections { grid-template-columns: 1fr; margin-top: 20px; gap: 15px; margin-bottom: 40px; }
                    .dash-card { min-height: 120px; padding: 20px; }
                    .dash-card h3 { font-size: 17px; }
                    .dash-card p { font-size: 13px; }
                    .invite-card { width: 90%; max-width: 350px; padding: 25px 15px; }
                    .invite-card h2 { font-size: 20px; }
                    .logout-btn { top: 15px; left: 15px; padding: 8px 14px; font-size: 12px; }
                }
            `}</style>
        </div>
    );
};

export default VegetableDashboard;
