import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';
import Layout from '../../components/Layout';
import { API_BASE_URL } from '../../apiConfig';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = usePopup();
    const { userId: hotelId } = useAuth('hotelId', '/hotel/login');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hotelData, setHotelData] = useState(null);
    const [products, setProducts] = useState([]);
    
    // Segment States
    const [morningOrders, setMorningOrders] = useState([]);
    const [eveningOrders, setEveningOrders] = useState([]);
    const [extraOrders, setExtraOrders] = useState([]);
    
    // Status States
    const [statuses, setStatuses] = useState({ morning: 'draft', evening: 'draft', extra: 'draft' });
    
    // Timing States
    const [times, setTimes] = useState({ morning: '08:00', evening: '19:00' });
    
    // Date (defaults to today)
    const today = new Date().toISOString().split('T')[0];
    const [activeDate, setActiveDate] = useState(today);

    useEffect(() => {
        if (hotelId) {
            fetchInitialData();
        }
    }, [hotelId, activeDate]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Hotel Data (to get linkedStoreId and timings)
            const hotelRes = await fetch(`${API_BASE_URL}/api/hotel/${hotelId}`);
            const hData = await hotelRes.json();
            setHotelData(hData);
            setTimes({ morning: hData.morningOrderTime || '08:00', evening: hData.eveningOrderTime || '19:00' });

            // 2. Fetch Products from linked store
            if (hData.linkedStoreId) {
                const prodRes = await fetch(`${API_BASE_URL}/api/product/store/${hData.linkedStoreId}`);
                const pData = await prodRes.json();
                setProducts(pData);
            }

            // 3. Fetch Bill for the active date
            const billRes = await fetch(`${API_BASE_URL}/api/bill/${hotelId}?date=${activeDate}`);
            const bData = await billRes.json();

            if (bData && !bData.message) {
                setMorningOrders(bData.morningOrders || []);
                setEveningOrders(bData.eveningOrders || []);
                setExtraOrders(bData.extraOrders || []);
                setStatuses({
                    morning: bData.morningStatus || 'draft',
                    evening: bData.eveningStatus || 'draft',
                    extra: bData.extraStatus || 'draft'
                });
            } else {
                // If it's a template or no bill found
                setMorningOrders(bData.morningOrders || []);
                setEveningOrders(bData.eveningOrders || []);
                setExtraOrders([]);
                setStatuses({ morning: 'draft', evening: 'draft', extra: 'draft' });
            }
        } catch (err) {
            console.error(err);
            showAlert('Failed to load order data', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (segment) => {
        const newItem = { name: '', price: 0, quantity: 1, unit: 'kg' };
        if (segment === 'morning') setMorningOrders([...morningOrders, newItem]);
        if (segment === 'evening') setEveningOrders([...eveningOrders, newItem]);
        if (segment === 'extra') setExtraOrders([...extraOrders, newItem]);
    };

    const handleProductSelect = (index, productId, segment) => {
        const product = products.find(p => p._id === productId);
        if (!product) return;

        const updateFn = (orders) => {
            const newOrders = [...orders];
            newOrders[index] = { 
                ...newOrders[index], 
                name: product.name, 
                price: product.price,
                unit: product.unit || 'kg' // ✅ Auto-set unit from product
            };
            return newOrders;
        };

        if (segment === 'morning') setMorningOrders(updateFn(morningOrders));
        if (segment === 'evening') setEveningOrders(updateFn(eveningOrders));
        if (segment === 'extra') setExtraOrders(updateFn(extraOrders));
    };

    const handleInputChange = (index, field, value, segment) => {
        const updateFn = (orders) => {
            const newOrders = [...orders];
            newOrders[index] = { ...newOrders[index], [field]: value };
            return newOrders;
        };

        if (segment === 'morning') setMorningOrders(updateFn(morningOrders));
        if (segment === 'evening') setEveningOrders(updateFn(eveningOrders));
        if (segment === 'extra') setExtraOrders(updateFn(extraOrders));
    };

    const handleRemoveItem = (index, segment) => {
        if (segment === 'morning') setMorningOrders(morningOrders.filter((_, i) => i !== index));
        if (segment === 'evening') setEveningOrders(eveningOrders.filter((_, i) => i !== index));
        if (segment === 'extra') setExtraOrders(extraOrders.filter((_, i) => i !== index));
    };

    const calculateTotal = (orders) => orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSave = async (specificStatusChange = {}) => {
        // Stock Validation (only if sending)
        const checkStock = (orders, segmentName) => {
            for (const item of orders) {
                const product = products.find(p => p.name === item.name);
                if (product && item.quantity > product.stock) {
                    showAlert(`Insufficient stock for "${item.name}" in ${segmentName} batch. Available: ${product.stock} ${product.unit || 'kg'}`, 'No Stock 🚫');
                    return false;
                }
            }
            return true;
        };

        if (specificStatusChange.morning === 'sent' && !checkStock(morningOrders, 'Morning')) return;
        if (specificStatusChange.evening === 'sent' && !checkStock(eveningOrders, 'Evening')) return;
        if (specificStatusChange.extra === 'sent' && !checkStock(extraOrders, 'Extra')) return;

        setSaving(true);
        try {
            const totalAmount = calculateTotal(morningOrders) + calculateTotal(eveningOrders) + calculateTotal(extraOrders);
            
            const payload = {
                hotelId,
                date: activeDate,
                morningOrders,
                eveningOrders,
                extraOrders,
                morningStatus: specificStatusChange.morning || statuses.morning,
                eveningStatus: specificStatusChange.evening || statuses.evening,
                extraStatus: specificStatusChange.extra || statuses.extra,
                totalAmount
            };

            const res = await fetch('https://powerful-solace-production-4309.up.railway.app/api/bill/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showAlert('Order saved successfully', 'Success');
                if (Object.keys(specificStatusChange).length > 0) {
                    setStatuses({ ...statuses, ...specificStatusChange });
                }
                // Refresh data to get updated stock levels
                fetchInitialData();
            } else {
                showAlert('Failed to save order', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error while saving', 'Error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSchedule = async () => {
        try {
            const res = await fetch(`https://powerful-solace-production-4309.up.railway.app/api/hotel/update-schedule/${hotelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ morningOrderTime: times.morning, eveningOrderTime: times.evening })
            });
            if (res.ok) {
                showAlert('Order timings updated successfully', 'Schedule Set');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const isPastTime = (targetTime) => {
        if (activeDate !== today) return false;
        const now = new Date();
        const [hours, minutes] = targetTime.split(':').map(Number);
        const targetDate = new Date();
        targetDate.setHours(hours, minutes, 0, 0);
        return now > targetDate;
    };

    const renderSegment = (title, orders, segmentKey, targetTime) => {
        const isSent = statuses[segmentKey] === 'sent';
        const isAlarm = !isSent && isPastTime(targetTime);

        return (
            <div className={`order-segment ${segmentKey} ${isAlarm ? 'alarm' : ''}`}>
                <div className="segment-header">
                    <h2>{title} {isAlarm && <span className="alarm-text">⚠️ OVERDUE!</span>}</h2>
                    <div className="segment-actions">
                        <span className={`status-badge ${statuses[segmentKey]}`}>{statuses[segmentKey]}</span>
                        <button 
                            className="send-btn" 
                            onClick={() => handleSave({ [segmentKey]: 'sent' })}
                            disabled={isSent || saving}
                        >
                            {isSent ? 'Sent ✅' : 'Send Order 🚀'}
                        </button>
                    </div>
                </div>

                <div className="items-list">
                    {orders.map((item, index) => (
                        <div key={index} className="order-item-row">
                            <div className="product-col">
                                <select 
                                    value={products.find(p => p.name === item.name)?._id || ''}
                                    onChange={(e) => handleProductSelect(index, e.target.value, segmentKey)}
                                    disabled={isSent}
                                    className="product-select"
                                >
                                    <option value="">Select Item from Store...</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                                {item.name && (
                                    <span className={`stock-info ${products.find(p => p.name === item.name)?.stock <= 0 ? 'out' : ''}`}>
                                        📦 Stock: {products.find(p => p.name === item.name)?.stock || 0} {products.find(p => p.name === item.name)?.unit || 'kg'}
                                    </span>
                                )}
                            </div>
                            
                            
                            <div className="qty-price">
                                <input 
                                    type="number" 
                                    placeholder="Qty" 
                                    value={item.quantity} 
                                    onChange={(e) => handleInputChange(index, 'quantity', parseFloat(e.target.value), segmentKey)}
                                    disabled={isSent}
                                />
                                <select 
                                    value={item.unit} 
                                    onChange={(e) => handleInputChange(index, 'unit', e.target.value, segmentKey)}
                                    disabled={isSent}
                                >
                                    <option value="kg">kg</option>
                                    <option value="pcs">pcs</option>
                                    <option value="ltr">ltr</option>
                                    <option value="pkt">pkt</option>
                                </select>
                            </div>
                            
                            <div className="price-display">
                                <span className="currency">₹</span>
                                <input 
                                    type="number" 
                                    placeholder="Price" 
                                    value={item.price} 
                                    readOnly 
                                    disabled
                                />
                            </div>
                            
                            {!isSent && (
                                <button className="remove-btn" onClick={() => handleRemoveItem(index, segmentKey)}>✕</button>
                            )}
                        </div>
                    ))}
                    {!isSent && (
                        <button className="add-btn" onClick={() => handleAddItem(segmentKey)}>+ Add Item</button>
                    )}
                </div>
                
                <div className="segment-footer">
                    <span>Total: ₹{calculateTotal(orders)}</span>
                </div>
            </div>
        );
    };

    if (loading) return <Layout><div className="loading-container"><h2>Loading Order Form...</h2></div></Layout>;

    return (
        <Layout>
            <div className="place-order-page">
                <div className="header-section">
                    <div className="header-left">
                        <h1>🛒 Place Orders</h1>
                        <input 
                            type="date" 
                            className="date-picker" 
                            value={activeDate} 
                            onChange={(e) => setActiveDate(e.target.value)} 
                        />
                    </div>
                    <div className="header-center">
                        <div className="alarm-settings">
                            <div className="time-input">
                                <label>🌅 Morning Send Time:</label>
                                <input type="time" value={times.morning} onChange={(e) => setTimes({ ...times, morning: e.target.value })} />
                            </div>
                            <div className="time-input">
                                <label>🌙 Evening Send Time:</label>
                                <input type="time" value={times.evening} onChange={(e) => setTimes({ ...times, evening: e.target.value })} />
                            </div>
                            <button className="set-time-btn" onClick={handleUpdateSchedule}>Set Alarms ⏰</button>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="back-btn" onClick={() => navigate('/hotel/dashboard')}>← Back</button>
                    </div>
                </div>

                <div className="store-inventory-reference">
                    <h3>📋 Store Price List & Availability</h3>
                    <div className="inventory-grid">
                        {products.map(p => (
                            <div key={p._id} className={`inventory-item ${p.stock <= 0 ? 'no-stock' : ''}`}>
                                <span className="p-name">{p.name} {p.stock <= 0 && '🚫'}</span>
                                <div className="p-meta">
                                    <span className="p-stock">Stock: {p.stock} <small>{p.unit || 'kg'}</small></span>
                                    <span className="p-price">₹{p.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="segments-container">
                    {renderSegment('🌅 Morning Batch', morningOrders, 'morning', times.morning)}
                    {renderSegment('🌙 Evening Batch', eveningOrders, 'evening', times.evening)}
                    {renderSegment('➕ Extra / Forgotten Items', extraOrders, 'extra', '23:59')}
                </div>

                <div className="bottom-bar">
                    <div className="grand-total">
                        Grand Total: <b>₹ {calculateTotal(morningOrders) + calculateTotal(eveningOrders) + calculateTotal(extraOrders)}</b>
                    </div>
                    <button className="save-all-btn" onClick={() => handleSave()} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Draft 💾'}
                    </button>
                </div>

                <style jsx="true">{`
                    .place-order-page { width: 100%; max-width: 1200px; padding: 20px; }
                    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; gap: 20px; flex-wrap: wrap; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                    .header-left h1 { font-size: 24px; color: var(--primary-color); margin-bottom: 10px; }
                    .date-picker { padding: 8px 15px; border-radius: 10px; border: 1px solid #ddd; outline: none; font-weight: 600; color: #555; }
                    
                    .alarm-settings { display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap; }
                    .time-input { display: flex; flex-direction: column; }
                    .time-input label { font-size: 11px; font-weight: 700; color: #666; margin-bottom: 4px; }
                    .time-input input { padding: 8px; border-radius: 8px; border: 1px solid #ddd; outline: none; }
                    .set-time-btn { background: #333; color: white; border: none; padding: 10px 15px; border-radius: 10px; font-size: 12px; cursor: pointer; font-weight: 600; height: 36px; }

                    .back-btn { background: #f0f0f0; color: #333; border: none; padding: 10px 20px; border-radius: 30px; cursor: pointer; font-weight: 700; }

                    .segments-container { display: flex; flex-direction: column; gap: 30px; margin-bottom: 100px; }
                    
                    .order-segment { background: white; border-radius: 25px; padding: 25px; box-shadow: 0 15px 40px rgba(0,0,0,0.06); border: 2px solid transparent; transition: 0.3s; }
                    .order-segment.alarm { border-color: #ff4d4d; background: #fffcfc; animation: borderPulse 2s infinite; }
                    
                    @keyframes borderPulse {
                        0% { border-color: #ff4d4d; }
                        50% { border-color: #ffbaba; }
                        100% { border-color: #ff4d4d; }
                    }

                    .segment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px; }
                    .segment-header h2 { font-size: 18px; display: flex; align-items: center; gap: 10px; }
                    .alarm-text { color: #ff4d4d; font-size: 12px; font-weight: 800; animation: blink 1s infinite; }
                    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

                    .segment-actions { display: flex; gap: 10px; align-items: center; }
                    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                    .status-badge.draft { background: #eee; color: #666; }
                    .status-badge.sent { background: #e6f9ed; color: #0bb15d; }
                    .send-btn { background: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(11, 177, 93, 0.3); }
                    .send-btn:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }

                    .order-item-row { display: grid; grid-template-columns: 2.5fr 1.5fr 1fr 40px; gap: 12px; margin-bottom: 12px; align-items: center; }
                    .order-item-row select, .order-item-row input { padding: 12px; border-radius: 12px; border: 1px solid #eee; background: #f9f9f9; width: 100%; border: none; outline: none; }
                    .qty-price { display: flex; gap: 5px; }
                    .qty-price input { flex: 2; }
                    .qty-price select { flex: 1.2; padding: 12px 5px; }
                    .price-display { display: flex; align-items: center; background: #f0f0f0; border-radius: 12px; padding-left: 10px; opacity: 0.8; }
                    .price-display input { background: transparent; padding-left: 2px; font-weight: 700; color: #333; }

                    .store-inventory-reference { background: #fffcf0; padding: 20px; border-radius: 20px; margin-bottom: 30px; border: 1px solid #ffeeba; }
                    .store-inventory-reference h3 { font-size: 16px; margin-bottom: 15px; color: #856404; }
                    .inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
                    .inventory-item { background: white; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px; border: 1px solid #f8f1d8; font-size: 13px; transition: 0.3s; }
                    .inventory-item .p-name { font-weight: 800; color: #333; }
                    .inventory-item .p-meta { display: flex; justify-content: space-between; align-items: center; }
                    .inventory-item.no-stock { border-color: #ffbaba; background: #fff8f8; }
                    .p-stock { color: #666; font-size: 11px; }
                    .p-price { color: var(--primary-color); font-weight: 800; font-size: 15px; }

                    .product-col { position: relative; }
                    .stock-info { position: absolute; bottom: -8px; left: 5px; font-size: 10px; font-weight: 800; color: #0bb15d; background: white; padding: 0 5px; border-radius: 5px; }
                    .stock-info.out { color: #ff4d4d; }

                    .remove-btn { color: #ff4d4d; background: #fff1f1; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
                    .add-btn { background: #f0fbf5; color: var(--primary-color); border: 1px dashed var(--primary-color); padding: 12px; border-radius: 12px; width: 100%; font-weight: 700; cursor: pointer; margin-top: 10px; }

                    .segment-footer { text-align: right; margin-top: 15px; font-weight: 700; color: #444; }

                    .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 20px; display: flex; justify-content: center; align-items: center; gap: 40px; box-shadow: 0 -10px 30px rgba(0,0,0,0.1); z-index: 100; border-top-left-radius: 30px; border-top-right-radius: 30px; }
                    .grand-total { font-size: 20px; color: #333; }
                    .grand-total b { color: var(--primary-color); font-size: 26px; }
                    .save-all-btn { background: #333; color: white; border: none; padding: 15px 40px; border-radius: 30px; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }

                    @media (max-width: 768px) {
                        .order-item-row { grid-template-columns: 1fr; gap: 8px; border: 1px solid #f0f0f0; padding: 15px; border-radius: 15px; position: relative; }
                        .remove-btn { position: absolute; top: 10px; right: 10px; }
                        .header-section { flex-direction: column; align-items: stretch; }
                        .bottom-bar { flex-direction: column; gap: 15px; padding: 15px; }
                        .save-all-btn { width: 100%; }
                    }
                `}</style>
            </div>
        </Layout>
    );
};

export default PlaceOrder;
