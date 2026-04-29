import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';

const StorePayments = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert, showConfirm } = usePopup();

    // Determine store type and ID from URL
    const isVegetable = location.pathname.includes('vegetable');
    const isMeat = location.pathname.includes('meat');
    const isDept = location.pathname.includes('department');
    
    let role, storageKey, dashboardPath;
    if (isVegetable) { role = 'vegetable'; storageKey = 'vegId'; dashboardPath = '/vegetable/dashboard'; }
    else if (isMeat) { role = 'meat'; storageKey = 'meatId'; dashboardPath = '/meat/dashboard'; }
    else { role = 'department'; storageKey = 'deptId'; dashboardPath = '/department/dashboard'; }

    const { userId: storeId } = useAuth(storageKey, `/${role}/login`);
    
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (storeId) {
            fetchPayments();
        }
    }, [storeId]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://powerful-solace-production-4309.up.railway.app/api/payments/store/${storeId}`);
            const data = await res.json();
            setPayments(data);
        } catch (err) {
            console.error(err);
            showAlert('Failed to load payments', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (paymentId) => {
        const confirm = await showConfirm('Are you sure you want to confirm this payment?', 'Confirm Payment');
        if (!confirm) return;

        try {
            const res = await fetch(`https://powerful-solace-production-4309.up.railway.app/api/payments/${paymentId}/confirm`, {
                method: "PATCH"
            });
            if (res.ok) {
                showAlert('Payment confirmed', 'Success');
                setPayments(payments.map(p => p._id === paymentId ? { ...p, status: 'confirmed', confirmedAt: new Date() } : p));
            } else {
                showAlert('Failed to confirm payment', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server Error', 'Error');
        }
    };

    const handleReject = async (paymentId) => {
        const confirm = await showConfirm('Are you sure you want to REJECT this payment?', 'Reject Payment');
        if (!confirm) return;

        try {
            const res = await fetch(`https://powerful-solace-production-4309.up.railway.app/api/payments/${paymentId}/reject`, {
                method: "PATCH"
            });
            if (res.ok) {
                showAlert('Payment rejected', 'Success');
                setPayments(payments.map(p => p._id === paymentId ? { ...p, status: 'rejected' } : p));
            } else {
                showAlert('Failed to reject payment', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server Error', 'Error');
        }
    };

    return (
        <div className="store-payments-page">
            <div className="main-overlay"></div>
            
            <div className="header">
                <button className="back-btn" onClick={() => navigate(dashboardPath)}>← Dashboard</button>
                <h1>Payments Dashboard 💳</h1>
                <p>Manage incoming payments from your hotels</p>
            </div>

            <div className="content-area">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading payments...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="empty-state">
                        <h2>No payments yet</h2>
                        <p>When hotels record a payment, it will appear here for confirmation.</p>
                        <button className="back-btn-primary" onClick={() => navigate(dashboardPath)}>Return to Dashboard</button>
                    </div>
                ) : (
                    <div className="payments-grid">
                        {payments.map(payment => (
                            <div key={payment._id} className="payment-card">
                                <div className="payment-card-header">
                                    <div className="hotel-info">
                                        <img src={payment.hotelId?.profileImage || '/profile.jpg'} alt="hotel" />
                                        <div>
                                            <h4>{payment.hotelId?.hotelName || 'Unknown Hotel'}</h4>
                                            <p>{new Date(payment.initiatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="payment-amount">
                                        ₹ {payment.amount}
                                    </div>
                                </div>
                                
                                <div className="payment-status">
                                    <span className={`status-badge ${payment.status}`}>
                                        {payment.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                {payment.status === 'pending_confirmation' && (
                                    <div className="action-buttons">
                                        <button className="confirm-btn" onClick={() => handleConfirm(payment._id)}>
                                            ✅ Confirm
                                        </button>
                                        <button className="reject-btn" onClick={() => handleReject(payment._id)}>
                                            ❌ Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx="true">{`
                .store-payments-page {
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
                .header, .content-area {
                    position: relative;
                    z-index: 1;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .header { text-align: center; margin-bottom: 40px; }
                .header h1 { font-size: 38px; margin: 10px 0; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
                .header p { opacity: 0.8; font-size: 18px; }
                
                .back-btn { position: absolute; left: 0; top: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 20px; border-radius: 50px; cursor: pointer; backdrop-filter: blur(10px); transition: 0.3s; }
                .back-btn:hover { background: rgba(255,255,255,0.2); transform: translateX(-5px); }

                .payments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 25px; }
                .payment-card { background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 25px; color: #333; box-shadow: 0 15px 35px rgba(0,0,0,0.2); transition: 0.3s; }
                .payment-card:hover { transform: translateY(-5px); }
                
                .payment-card-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
                .hotel-info { display: flex; gap: 12px; align-items: center; }
                .hotel-info img { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
                .hotel-info h4 { margin: 0; font-size: 18px; color: #111; }
                .hotel-info p { margin: 3px 0 0; font-size: 13px; color: #777; }
                
                .payment-amount { font-size: 24px; font-weight: 800; color: #0bb15d; }
                
                .payment-status { margin-bottom: 15px; }
                .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; }
                .status-badge.pending_confirmation { background: #fff3cd; color: #856404; }
                .status-badge.confirmed { background: #d4edda; color: #155724; }
                .status-badge.rejected { background: #f8d7da; color: #721c24; }
                
                .action-buttons { display: flex; gap: 10px; }
                .confirm-btn, .reject-btn { flex: 1; padding: 12px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; color: white; }
                .confirm-btn { background: #0bb15d; }
                .confirm-btn:hover { background: #09944d; }
                .reject-btn { background: #dc3545; }
                .reject-btn:hover { background: #c82333; }
                
                .loading-state, .empty-state { text-align: center; padding: 80px 0; }
                .spinner { width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.1); border-top-color: #0bb15d; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .back-btn-primary { background: #0bb15d; color: white; border: none; padding: 15px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 20px; }

                @media (max-width: 768px) {
                    .header h1 { font-size: 28px; }
                    .back-btn { position: relative; display: block; margin: 0 auto 20px; }
                    .payments-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default StorePayments;
