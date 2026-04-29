import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';

const LinkedHotels = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert } = usePopup();
    
    // Determine store type and ID from URL
    const isVegetable = location.pathname.includes('vegetable');
    const isMeat = location.pathname.includes('meat');
    const isDept = location.pathname.includes('department');
    
    let role, storageKey, dashboardPath;
    if (isVegetable) { role = 'vegetable'; storageKey = 'vegId'; dashboardPath = '/vegetable/dashboard'; }
    else if (isMeat) { role = 'meat'; storageKey = 'meatId'; dashboardPath = '/meat/dashboard'; }
    else { role = 'department'; storageKey = 'deptId'; dashboardPath = '/department/dashboard'; }

    const { userId: storeId } = useAuth(storageKey, `/${role}/login`);
    
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (storeId) {
            fetchLinkedHotels();
        }
    }, [storeId]);

    const fetchLinkedHotels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://powerful-solace-production-4309.up.railway.app/api/store/linked-hotels/${storeId}`);
            const data = await res.json();
            setHotels(data);
        } catch (err) {
            console.error("Hotels fetch error:", err);
            showAlert('Failed to load hotels', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="linked-hotels-page">
            <div className="main-overlay"></div>
            
            <div className="header">
                <button className="back-btn" onClick={() => navigate(dashboardPath)}>← Dashboard</button>
                <h1>Connected Hotels 🏨</h1>
                <p>Manage all hotels connected to your {role} store</p>
            </div>

            <div className="content-area">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading connections...</p>
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="empty-state">
                        <h2>No hotels linked yet</h2>
                        <p>Go to the dashboard and click "+ ADD HOTEL" to start connecting.</p>
                        <button className="back-btn-primary" onClick={() => navigate(dashboardPath)}>Return to Dashboard</button>
                    </div>
                ) : (
                    <div className="hotels-grid">
                        {hotels.map(hotel => (
                            <div key={hotel._id} className="hotel-card" onClick={() => showAlert(`Contact: ${hotel.phone}\nOwner: ${hotel.ownerName}`, hotel.hotelName)}>
                                <div className="hotel-card-header">
                                    <div className="img-container">
                                        <img src={hotel.profileImage || 'profile.jpg'} alt="hotel" />
                                    </div>
                                    <div className="hotel-title">
                                        <h4>{hotel.hotelName}</h4>
                                        <p>{hotel.ownerName}</p>
                                    </div>
                                </div>
                                <div className="hotel-card-footer">
                                    <div className="info-row">
                                        <span>📍</span>
                                        <p>{hotel.location}</p>
                                    </div>
                                    <div className="info-row">
                                        <span>📞</span>
                                        <p>{hotel.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx="true">{`
                .linked-hotels-page {
                    min-height: 100vh;
                    background: ${isVegetable ? "url('https://images.unsplash.com/photo-1542838132-92c53300491e')" : 
                                 isMeat ? "url('https://images.unsplash.com/photo-1607623814075-e51df1bdc82f')" : 
                                 "url('https://akm-img-a-in.tosshub.com/indiatoday/images/story/202203/Grocery_store.jpg')"};
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                    position: relative;
                    color: white;
                    padding: 40px 20px;
                }
                .main-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    z-index: 0;
                }
                .header {
                    position: relative;
                    z-index: 1;
                    max-width: 1200px;
                    margin: 0 auto 40px;
                    text-align: center;
                }
                .header h1 {
                    font-size: 42px;
                    margin: 10px 0;
                    text-shadow: 0 4px 10px rgba(0,0,0,0.5);
                }
                .header p {
                    opacity: 0.8;
                    font-size: 18px;
                }
                .back-btn {
                    position: absolute;
                    left: 0;
                    top: 10px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 50px;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: 0.3s;
                }
                .back-btn:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateX(-5px);
                }
                
                .content-area {
                    position: relative;
                    z-index: 1;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .hotels-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 30px;
                }
                
                .hotel-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 30px;
                    padding: 30px;
                    transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }
                .hotel-card:hover {
                    transform: translateY(-10px);
                    background: rgba(255, 255, 255, 0.15);
                    border-color: #0bb15d;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                
                .hotel-card-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 25px;
                }
                .img-container {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 2px solid rgba(255,255,255,0.2);
                }
                .img-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .hotel-title h4 {
                    margin: 0;
                    font-size: 22px;
                    color: #fff;
                }
                .hotel-title p {
                    margin: 5px 0 0;
                    font-size: 14px;
                    opacity: 0.6;
                }
                
                .hotel-card-footer {
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .info-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .info-row span {
                    font-size: 18px;
                }
                .info-row p {
                    margin: 0;
                    font-size: 15px;
                    opacity: 0.8;
                }
                
                .loading-state, .empty-state {
                    text-align: center;
                    padding: 100px 0;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(255,255,255,0.1);
                    border-top-color: #0bb15d;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                .back-btn-primary {
                    background: #0bb15d;
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 50px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    margin-top: 20px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                }

                @media (max-width: 768px) {
                    .header h1 { font-size: 32px; }
                    .back-btn { position: relative; display: block; margin: 0 auto 20px; }
                    .hotels-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default LinkedHotels;
