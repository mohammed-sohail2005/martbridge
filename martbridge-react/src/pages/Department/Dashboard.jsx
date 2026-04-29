import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';
import { API_BASE_URL } from '../../apiConfig';

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = usePopup();
    const { userId: deptId, logout } = useAuth('deptId', '/department/register');
    
    const [storeData, setStoreData] = useState({
        storeName: 'Loading...',
        profileImage: 'profile.jpg'
    });
    const [labors, setLabors] = useState([]);
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
    const [products, setProducts] = useState([]);
    const [showInventoryPopup, setShowInventoryPopup] = useState(false);


    useEffect(() => {
        if (deptId) {
            fetchStoreData();
            fetchIncomingOrders();
            fetchLinkedHotels();
            fetchProducts();
            fetchLabors();
        }
    }, [deptId]);

    const fetchStoreData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/department/${deptId}`);
            const data = await res.json();
            setStoreData(data);
        } catch (err) {
            console.error(err);
            showAlert('Server error while loading dashboard', 'Error');
        }
    };

    const fetchLabors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/labor/owner/${deptId}`);
            const data = await res.json();
            setLabors(data);
        } catch (err) {
            console.error("Labor fetch error:", err);
        }
    };



    const fetchIncomingOrders = async () => {
        setOrdersLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`${API_BASE_URL}/api/store/incoming-orders/${deptId}?date=${today}`);
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
            const res = await fetch(`${API_BASE_URL}/api/store/linked-hotels/${deptId}`);
            const data = await res.json();
            setLinkedHotels(data);
        } catch (err) {
            console.error("Hotels fetch error:", err);
        } finally {
            setHotelsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/product/store/${deptId}`);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Products fetch error:", err);
        }
    };

    const handleUpdateStock = async (prodId, newStock, newUnit) => {
        setUpdatingStockId(prodId);
        try {
            const res = await fetch(`${API_BASE_URL}/api/product/update-stock/${prodId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: newStock, unit: newUnit })
            });
            if (res.ok) {
                fetchProducts();
            } else {
                showAlert('Failed to update inventory', 'Error');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStockId(null);
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
            const res = await fetch(`${API_BASE_URL}/api/store/invite-hotel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hotelName: inviteHotelName, storeId: deptId, storeType: "department" })
            });

            if (res.ok) {
                const baseUrl = window.location.origin;
                const link = `${baseUrl}/hotel/register?storeId=${deptId}&storeType=department&hotelName=${encodeURIComponent(inviteHotelName)}`;
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

    const totalMonthlySalary = labors.reduce((sum, l) => sum + l.salary, 0);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                <img 
                    src={storeData.profileImage || 'profile.jpg'} 
                    className="profile-icon" 
                    onClick={() => setShowProfilePopup(true)} 
                    alt="profile"
                />
            </div>

            {showProfilePopup && (
                <div className="overlay-blur" onClick={() => setShowProfilePopup(false)}>
                    <div className="profile-popup" onClick={e => e.stopPropagation()}>
                        <img src={storeData.profileImage || 'profile.jpg'} className="popup-img" alt="profile" />
                        <h2>{storeData.storeName}</h2>
                        <button className="edit-btn" onClick={() => navigate('/department/profile')}>Edit Profile</button>
                        <span className="close-btn" onClick={() => setShowProfilePopup(false)}>✕</span>
                    </div>
                </div>
            )}

            <div className="main-overlay"></div>

            {showInvitePopup && (
                <div className="overlay-blur" onClick={() => setShowInvitePopup(false)}>
                    <div className="invite-card" onClick={e => e.stopPropagation()}>
                        <h2>✨ Invite Hotel</h2>
                        <p>Send an invitation to connect automatically.</p>
                        <div className="input-group">
                            <input type="text" value={inviteHotelName} onChange={e => setInviteHotelName(e.target.value)} placeholder=" " required />
                            <label>Hotel Name</label>
                        </div>
                        <button className="invite-btn" onClick={handleSendInvite} disabled={inviteLoading}>
                            {inviteLoading ? 'Sending...' : 'Send Invitation 🚀'}
                        </button>
                        <span className="close-btn" onClick={() => setShowInvitePopup(false)}>✕</span>
                    </div>
                </div>
            )}

            {showLinkPopup && (
                <div className="overlay-blur" style={{ zIndex: 10001 }} onClick={() => setShowLinkPopup(false)}>
                    <div className="invite-card" onClick={e => e.stopPropagation()}>
                        <h2>🔗 Invitation Link</h2>
                        <p>Share this link with the hotel owner.</p>
                        <div className="input-group">
                            <input type="text" value={generatedLink} readOnly style={{ color: '#0bb15d', fontWeight: 'bold' }} />
                            <label>Registration Link</label>
                        </div>
                        <button className="invite-btn" onClick={() => {
                            navigator.clipboard.writeText(generatedLink);
                            showAlert('Copied! ✅', 'Copied');
                        }}>Copy Link 📋</button>
                        <span className="close-btn" onClick={() => setShowLinkPopup(false)}>✕</span>
                    </div>
                </div>
            )}

            {showInventoryPopup && (
                <div className="overlay-blur" style={{ zIndex: 10002 }} onClick={() => setShowInventoryPopup(false)}>
                    <div className="inventory-modal modal-responsive" onClick={e => e.stopPropagation()}>
                        <h2>📦 Inventory Management</h2>
                        <p>Update stock levels and units.</p>
                        
                        <div className="inventory-list">
                            {products.length === 0 ? <p>No products found. Add some in "Set Prices".</p> : 
                                products.map(p => (
                                    <div key={p._id} className="inventory-row">
                                        <div className="prod-meta">
                                            <span className="prod-name">{p.name}</span>
                                        </div>
                                        <div className="prod-inputs">
                                            <div className="input-box">
                                                <label>Stock</label>
                                                <input 
                                                    type="number" 
                                                    defaultValue={p.stock} 
                                                    onBlur={(e) => handleUpdateStock(p._id, parseFloat(e.target.value), p.unit)} 
                                                    disabled={updatingStockId === p._id}
                                                />
                                            </div>
                                            <div className="input-box">
                                                <label>Unit</label>
                                                <input 
                                                    type="text" 
                                                    defaultValue={p.unit || 'kg'} 
                                                    onBlur={(e) => handleUpdateStock(p._id, p.stock, e.target.value)} 
                                                    disabled={updatingStockId === p._id}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <span className="close-btn" onClick={() => setShowInventoryPopup(false)}>✕</span>
                        <button className="done-btn" onClick={() => setShowInventoryPopup(false)}>Done</button>
                    </div>
                </div>
            )}



            <div className="center-content">
                <h1>DEPARTMENT STORE</h1>
                <h2>{storeData.storeName}</h2>
                <button className="add-hotel" onClick={() => setShowInvitePopup(true)}>+ ADD HOTEL</button>
            </div>

            <div className="dash-sections">
                <div className="dash-card" onClick={() => navigate('/department/set-prices')}>
                    <h3>📦 Set Today's Prices</h3>
                    <p>Update daily item rates</p>
                </div>

                <div className="dash-card" onClick={() => navigate('/department/orders')}>
                    <h3>📥 Incoming Orders ({incomingOrders.length})</h3>
                    <p>Orders from connected hotels</p>
                </div>
                
                <div className="dash-card labor-card" onClick={() => navigate('/department/labor')}>
                    <h3>👷 Labor Card</h3>
                    <p>{labors.length} Workers</p>
                    <div className="summary-val">₹{totalMonthlySalary}</div>
                </div>

                <div className="dash-card" onClick={() => navigate('/department/hotels')}>
                    <h3>🏨 Connected Hotels ({linkedHotels.length})</h3>
                    <p>View all hotels linked to your store</p>
                </div>
                <div className="dash-card" onClick={() => navigate('/department/payments')}>
                    <h3>💳 View Payments</h3>
                    <p>Confirm incoming payments</p>
                </div>
                <div className="dash-card inventory-card" onClick={() => setShowInventoryPopup(true)}>
                    <h3>📦 Inventory & Stock</h3>
                    <p>Track {products.length} stocked items</p>
                </div>
            </div>

            <style jsx="true">{`
                .dashboard-page {
                    min-height: 100vh;
                    background: url('https://akm-img-a-in.tosshub.com/indiatoday/images/story/202203/Grocery_store.jpg?size=690:388') no-repeat center/cover;
                    position: relative;
                    color: white;
                    display: flex;
                    flex-direction: column;
                }
                .main-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.6); z-index: 0; }
                .dashboard-header { position: absolute; top: 0; left: 0; right: 0; padding: 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
                .profile-icon { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; cursor: pointer; border: 2px solid #00b050; transition: 0.3s; }
                .profile-icon:hover { transform: scale(1.1); }
                .logout-btn { padding: 10px 18px; border: none; border-radius: 20px; background: var(--danger-gradient); color: white; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 0, 0, 0.2); }
                .overlay-blur { position: fixed; inset: 0; backdrop-filter: blur(10px); background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 999; }
                .profile-popup, .invite-card { background: white; width: 320px; border-radius: 20px; padding: 30px 20px; text-align: center; position: relative; color: #222; }
                .invite-card { width: 380px; }
                .popup-img { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 4px solid #00b050; margin-top: -90px; background: white; }
                .edit-btn { margin-top: 20px; width: 100%; padding: 12px; background: #00b050; color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer; }
                .close-btn { position: absolute; top: 15px; right: 18px; font-size: 20px; cursor: pointer; color: #666; }
                .center-content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 100px 20px 20px; }
                .center-content h1 { font-size: 48px; margin-bottom: 10px; }
                .center-content h2 { color: #c8ffe4; margin-bottom: 30px; font-weight: 500; }
                .add-hotel { padding: 18px 50px; font-size: 20px; font-weight: 700; border: none; border-radius: 50px; background: #0bb15d; color: white; cursor: pointer; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); }
                .dash-sections { position: relative; z-index: 2; max-width: 1000px; margin: 40px auto 80px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; padding: 0 20px; width: 100%; }
                .dash-card { background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(14px); border-radius: 22px; padding: 28px; min-height: 160px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: pointer; transition: .3s; border: 1px solid rgba(255, 255, 255, 0.1); }
                .dash-card:hover { transform: translateY(-6px) scale(1.02); background: rgba(11, 177, 93, 0.25); }

                .labor-card { border: 1px solid rgba(255, 193, 7, 0.4); }
                .labor-card .summary-val { margin-top: 10px; font-weight: 800; color: #ffc107; font-size: 20px; }

                .input-group { position: relative; margin-bottom: 20px; text-align: left; }
                .input-group input { width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 12px; outline: none; font-size: 15px; background: #f9f9f9; }
                .input-group label { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #888; transition: 0.3s; pointer-events: none; font-size: 14px; }
                .input-group input:focus + label, .input-group input:not(:placeholder-shown) + label { top: 0; font-size: 12px; color: #00b050; background: white; font-weight: 600; }
                .invite-btn { width: 100%; padding: 14px; border: none; border-radius: 30px; background: linear-gradient(135deg, #00b050, #008a3e); color: white; font-size: 16px; font-weight: 700; cursor: pointer; }



                .inventory-modal { background: white; border-radius: 25px; position: relative; color: #222; text-align: center; }
                .inventory-list { margin-top: 20px; max-height: 400px; overflow-y: auto; padding-right: 10px; }
                .inventory-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
                .prod-meta { text-align: left; }
                .prod-name { display: block; font-weight: 700; color: #333; }
                .warning-tag { font-size: 10px; background: #ffebeb; color: #ff4d4d; padding: 2px 6px; border-radius: 4px; font-weight: 800; }
                .prod-inputs { display: flex; gap: 10px; }
                .input-box { display: flex; flex-direction: column; align-items: center; }
                .input-box label { font-size: 10px; font-weight: 800; color: #888; margin-bottom: 2px; }
                .input-box input { width: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 8px; text-align: center; font-weight: 700; }
                .done-btn { margin-top: 25px; width: 100%; padding: 12px; background: #333; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; }

                .inventory-card { position: relative; }

                @media (max-width: 768px) {
                    .center-content { padding-top: 80px; }
                    .center-content h1 { font-size: 26px; }
                    .center-content h2 { font-size: 16px; margin-bottom: 20px; }
                    .add-hotel { padding: 14px 30px; font-size: 16px; }
                    .dash-sections { grid-template-columns: 1fr; margin-top: 20px; gap: 15px; margin-bottom: 40px; }
                    .dash-card { min-height: 120px; padding: 20px; }
                    .dash-card h3 { font-size: 16px; }
                    .dash-card p { font-size: 13px; }
                    .invite-card { width: 92%; max-width: 350px; padding: 25px 15px; }
                    .invite-card h2 { font-size: 20px; }
                    .logout-btn { padding: 8px 14px; font-size: 11px; }
                    .dashboard-header { padding: 15px; }
                    .inventory-modal { width: 95%; padding: 20px; }
                    .inventory-row { flex-direction: column; align-items: flex-start; gap: 10px; }
                    .prod-inputs { width: 100%; justify-content: space-between; }
                    .profile-popup { width: 92%; }
                }
            `}</style>
        </div>
    );
};

export default DepartmentDashboard;
