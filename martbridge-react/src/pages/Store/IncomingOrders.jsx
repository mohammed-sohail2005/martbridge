import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';

const StoreIncomingOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert } = usePopup();

    const isVegetable = location.pathname.includes('vegetable');
    const isMeat = location.pathname.includes('meat');
    
    let role, storageKey, dashboardPath;
    if (isVegetable) { role = 'vegetable'; storageKey = 'vegId'; dashboardPath = '/vegetable/dashboard'; }
    else if (isMeat) { role = 'meat'; storageKey = 'meatId'; dashboardPath = '/meat/dashboard'; }
    else { role = 'department'; storageKey = 'deptId'; dashboardPath = '/department/dashboard'; }

    const { userId: storeId } = useAuth(storageKey, `/${role}/login`);

    const [incomingOrders, setIncomingOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (storeId) {
            fetchIncomingOrders();
        }
    }, [storeId, selectedDate]);

    const fetchIncomingOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://powerful-solace-production-4309.up.railway.app/api/store/incoming-orders/${storeId}?date=${selectedDate}`);
            const data = await res.json();
            setIncomingOrders(data);
        } catch (err) {
            console.error("Order fetch error:", err);
            showAlert('Failed to fetch orders', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="incoming-orders-page">
            <div className="main-overlay"></div>
            
            <div className="header">
                <button className="back-btn" onClick={() => navigate(dashboardPath)}>← Dashboard</button>
                <h1>Incoming Orders 📦</h1>
                <p>View and manage orders from hotels tied to your {role} store</p>
                <div className="date-filter">
                    <label>Select Date:</label>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                    />
                </div>
            </div>

            <div className="content-area">
                {loading ? (
                     <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : incomingOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h2>No Orders Found</h2>
                        <p>There are no orders on {selectedDate}.</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {incomingOrders.map(bill => (
                            <div key={bill._id} className="hotel-order-card" onClick={() => setSelectedOrder(bill)}>
                                <div className="hotel-info">
                                    <img src={bill.hotelId?.profileImage || 'https://st3.depositphotos.com/15648834/17930/v/450/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg'} alt="hotel" />
                                    <div>
                                        <h4>{bill.hotelId?.hotelName || 'Unknown Hotel'}</h4>
                                        <p>{bill.hotelId?.location || 'No Location'}</p>
                                    </div>
                                </div>
                                <div className="order-summary">
                                    {bill.morningStatus === 'sent' && <span className="batch morning">🌅 Morning</span>}
                                    {bill.eveningStatus === 'sent' && <span className="batch evening">🌙 Evening</span>}
                                    {bill.extraStatus === 'sent' && <span className="batch extra">➕ Extra</span>}
                                </div>
                                <div className="total-amt">₹ {bill.totalAmount}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Detail Popup */}
            {selectedOrder && (
                <div className="overlay-blur" onClick={() => setSelectedOrder(null)}>
                    <div className="order-detail-popup modal-responsive" onClick={e => e.stopPropagation()}>
                        <span className="close-btn" onClick={() => setSelectedOrder(null)}>✕</span>
                        <h3>Order from {selectedOrder.hotelId?.hotelName || 'Hotel'}</h3>
                        <p className="order-meta">📅 {selectedOrder.date} | 📞 {selectedOrder.hotelId?.phone}</p>
                        
                        <div className="order-sections-view">
                            {selectedOrder.morningStatus === 'sent' && (
                                <div className="view-segment">
                                    <h4>🌅 Morning Batch</h4>
                                    {selectedOrder.morningOrders.map((item, i) => (
                                        <div key={i} className="view-item">{item.name} x {item.quantity} {item.unit} - ₹{item.price * item.quantity}</div>
                                    ))}
                                </div>
                            )}
                            {selectedOrder.eveningStatus === 'sent' && (
                                <div className="view-segment">
                                    <h4>🌙 Evening Batch</h4>
                                    {selectedOrder.eveningOrders.map((item, i) => (
                                        <div key={i} className="view-item">{item.name} x {item.quantity} {item.unit} - ₹{item.price * item.quantity}</div>
                                    ))}
                                </div>
                            )}
                            {selectedOrder.extraStatus === 'sent' && (
                                <div className="view-segment">
                                    <h4>➕ Extra Items</h4>
                                    {selectedOrder.extraOrders.map((item, i) => (
                                        <div key={i} className="view-item">{item.name} x {item.quantity} {item.unit} - ₹{item.price * item.quantity}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grand-total-view">
                            Total amount: <b>₹ {selectedOrder.totalAmount}</b>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .incoming-orders-page {
                    min-height: 100vh;
                    background: url('https://akm-img-a-in.tosshub.com/indiatoday/images/story/202203/Grocery_store.jpg') no-repeat center/cover;
                    position: relative;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .main-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 0;
                }

                .header {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 1000px;
                    padding: 40px 20px 20px;
                    text-align: center;
                }

                .back-btn {
                    position: absolute;
                    left: 20px;
                    top: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                    backdrop-filter: blur(5px);
                    transition: 0.3s;
                }

                .back-btn:hover { background: rgba(255, 255, 255, 0.3); }

                .header h1 { font-size: 36px; color: #fff; margin-bottom: 5px; }
                .header p { color: #ccc; margin-bottom: 20px; }

                .date-filter {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255,255,255,0.15);
                    padding: 10px 20px;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }

                .date-filter label { font-weight: bold; color: white; }
                .date-filter input {
                    padding: 8px 12px;
                    border: none;
                    border-radius: 8px;
                    background: white;
                    font-size: 15px;
                    outline: none;
                }

                .content-area {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 1000px;
                    flex: 1;
                    padding: 0 20px 50px;
                }

                .loading-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                }

                .spinner {
                    width: 50px; height: 50px;
                    border: 5px solid rgba(255,255,255,0.2);
                    border-top-color: #0bb15d;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }

                @keyframes spin { 100% { transform: rotate(360deg); } }

                .empty-icon { font-size: 60px; margin-bottom: 15px; opacity: 0.8; }
                .empty-state h2 { font-size: 24px; margin-bottom: 10px; color: #fff; }
                .empty-state p { color: #aaa; }

                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                .hotel-order-card {
                    background: rgba(255, 255, 255, 0.95);
                    padding: 18px;
                    border-radius: 20px;
                    color: #333;
                    cursor: pointer;
                    transition: 0.3s;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }

                .hotel-order-card:hover { transform: translateY(-5px) scale(1.02); background: white; }

                .hotel-info { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
                .hotel-info img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
                .hotel-info h4 { margin: 0; font-size: 16px; color: #111; }
                .hotel-info p { margin: 0; font-size: 12px; color: #666; }

                .order-summary { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
                .batch { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 10px; text-transform: uppercase; }
                .batch.morning { background: #fff4e5; color: #b06e00; }
                .batch.evening { background: #eef2ff; color: #3730a3; }
                .batch.extra { background: #fdf2f2; color: #9b1c1c; }
                .total-amt { font-size: 20px; font-weight: 800; color: #0bb15d; text-align: right; }

                .overlay-blur { position: fixed; inset: 0; backdrop-filter: blur(10px); background: rgba(0, 0, 0, 0.4); display: flex; justify-content: center; align-items: center; z-index: 999; }
                
                .order-detail-popup { background: white; border-radius: 25px; position: relative; color: #222; text-align: left; }
                .close-btn { position: absolute; top: 15px; right: 18px; font-size: 20px; cursor: pointer; color: #666; }
                
                .order-meta { font-size: 13px; color: #888; margin-bottom: 20px; }
                .order-sections-view { display: flex; flex-direction: column; gap: 20px; max-height: 400px; overflow-y: auto; }
                .view-segment h4 { margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #00b050; }
                .view-item { font-size: 14px; margin-bottom: 4px; padding-left: 5px; }
                .grand-total-view { margin-top: 25px; border-top: 2px solid #f0f0f0; padding-top: 15px; text-align: right; font-size: 18px; }
                .grand-total-view b { color: #0bb15d; font-size: 24px; }

                @media (max-width: 768px) {
                    .back-btn { top: 20px; left: 10px; padding: 8px 12px; font-size: 13px; }
                    .header h1 { font-size: 28px; margin-top: 40px; }
                    .orders-grid { grid-template-columns: 1fr; }
                    .order-detail-popup { width: 90%; padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default StoreIncomingOrders;
