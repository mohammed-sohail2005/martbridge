import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';
import Layout from '../../components/Layout';

const HotelBills = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = usePopup();
    const { userId: hotelId } = useAuth('hotelId', '/hotel/login');
    
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [billingData, setBillingData] = useState(null);
    const [billingError, setBillingError] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    
    // Store info
    const [storeInfo, setStoreInfo] = useState({ id: null, type: null });

    useEffect(() => {
        if (hotelId) {
            initializeData();
        }
    }, [hotelId]);

    const initializeData = async () => {
        setLoading(true);
        try {
            const hotelRes = await fetch(`http://localhost:5000/api/hotel/${hotelId}`);
            if (!hotelRes.ok) throw new Error('Could not fetch hotel profile');
            const hotelData = await hotelRes.json();
            
            if (hotelData && hotelData.linkedStoreId) {
                setStoreInfo({ id: hotelData.linkedStoreId, type: hotelData.storeType });
                
                // Fetch these without letting one failure block everything
                fetchBills();
                fetchBillingData(hotelData.linkedStoreId);
            } else {
                showAlert('This hotel is not yet linked to a store. Please contact your store owner.', 'Warning');
            }
        } catch (err) {
            console.error("Initialization Error:", err);
            showAlert('Failed to connect to server. Please try again.', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const fetchBills = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/bill/history/${hotelId}`);
            if (res.ok) {
                const data = await res.json();
                setBills(data);
            }
        } catch (err) {
            console.error("History Fetch Error:", err);
        }
    };

    const fetchBillingData = async (storeId) => {
        try {
            setBillingError(false);
            const res = await fetch(`http://localhost:5000/api/billing/${hotelId}/${storeId}`);
            if (res.ok) {
                const data = await res.json();
                setBillingData(data);
            } else {
                setBillingError(true);
            }
        } catch (err) {
            console.error("Billing Fetch Error:", err);
            setBillingError(true);
        }
    };

    const triggerUpiPayment = () => {
        if (!billingData?.storeUpiId || !paymentAmount) return false;
        
        // Construct standard UPI URL
        // pa: payee address, pn: payee name, am: amount, cu: currency
        const upiUrl = `upi://pay?pa=${billingData.storeUpiId}&pn=${encodeURIComponent(billingData.storeName || 'Store')}&am=${paymentAmount}&cu=INR`;
        
        console.log("🔗 Opening UPI:", upiUrl);
        window.location.href = upiUrl;
        return true;
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        
        if (!paymentAmount || Number(paymentAmount) <= 0) {
            return showAlert('Please enter a valid amount', 'Invalid Amount');
        }

        if (!billingData?.storeUpiId) {
            const proceed = await showConfirm("The store owner hasn't shared their UPI ID yet. You can still record this payment manually if you paid via another method. Proceed?", "UPI ID Missing");
            if (!proceed) return;
        }

        const confirm = await showConfirm(`Record payment of ₹${paymentAmount}? This will also try to open your UPI app.`, 'Confirm Payment');
        if (!confirm) return;

        // 🚀 Trigger UPI App Open
        triggerUpiPayment();

        setPaymentSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/payments/initiate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotelId,
                    storeId: storeInfo.id,
                    storeType: storeInfo.type,
                    amount: Number(paymentAmount)
                })
            });

            const result = await res.json();

            if (res.ok) {
                showAlert('Payment recorded! Pending store confirmation.', 'Success');
                setPaymentAmount('');
                // Refresh data
                fetchBillingData(storeInfo.id);
            } else {
                showAlert(result.error || 'Failed to record payment', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server Error: Connection failed', 'Error');
        } finally {
            setPaymentSubmitting(false);
        }
    };

    const copyUpi = () => {
        if (billingData?.storeUpiId) {
            navigator.clipboard.writeText(billingData.storeUpiId);
            showAlert('UPI ID copied to clipboard!', 'Copied');
        }
    };

    return (
        <Layout>
            <div className="bills-header">
                <h1>🧾 Your Bills & Payments</h1>
                <button className="back-btn" onClick={() => navigate('/hotel/dashboard')}>← Back</button>
            </div>

            {loading ? (
                <div className="card"><p>Loading data...</p></div>
            ) : (
                <>
                    {/* BILLING WIDGET */}
                    <div className="billing-widget">
                        {billingData ? (
                            <div className="billing-stats">
                                <h3>Pending Amount</h3>
                                <div className="amount">₹ {billingData.pendingAmount ?? '0'}</div>
                                
                                <div className="upi-section">
                                    <span className="upi-label">Store UPI ID:</span>
                                    {billingData.storeUpiId ? (
                                        <>
                                            <span className="upi-id">{billingData.storeUpiId}</span>
                                            <button className="copy-btn" type="button" onClick={copyUpi}>Copy UPI Link 📋</button>
                                        </>
                                    ) : (
                                        <span className="upi-error">Not shared by store yet ⚠️</span>
                                    )}
                                </div>
                            </div>
                        ) : billingError ? (
                            <div className="billing-stats empty error">
                                <p>⚠️ Billing summary currently unavailable.</p>
                                <button onClick={() => storeInfo.id && fetchBillingData(storeInfo.id)}>Retry</button>
                            </div>
                        ) : (
                            <div className="billing-stats empty">
                                <p>Calculating balance...</p>
                            </div>
                        )}
                        
                        <div className="payment-form">
                            <h3>Record a Payment</h3>
                            <p>Paid via UPI? Add the record below to update your balance.</p>
                            <form onSubmit={handleRecordPayment} className="form-payload">
                                <input 
                                    type="number" 
                                    placeholder="Enter Amount paid (₹)" 
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    required 
                                />
                                <button type="submit" disabled={paymentSubmitting || !storeInfo.id}>
                                    {paymentSubmitting ? 'Recording...' : 'Record Payment'}
                                </button>
                            </form>
                            {!storeInfo.id && <p className="error-small">⚠️ Only linked hotels can record payments.</p>}
                        </div>
                    </div>

                    <div className="card mt-20">
                        <h3>Order History</h3>
                        {bills.length === 0 ? (
                            <p>No bills found.</p>
                        ) : (
                            <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Store</th>
                                            <th>Type</th>
                                            <th>Amount (₹)</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bills.map((bill) => (
                                            <tr key={bill._id}>
                                                <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                                                <td>{bill.storeName}</td>
                                                <td>{bill.storeType}</td>
                                                <td><b>₹ {bill.totalAmount}</b></td>
                                                <td>
                                                    <span className={`status ${bill.status}`}>
                                                        {bill.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            <style jsx="true">{`
                .bills-header { width: 100%; max-width: 1100px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-radius: 22px; padding: 18px 25px; box-shadow: 0 10px 30px rgba(0, 0, 0, .1); }
                .bills-header h1 { color: #111; font-size: 24px; font-weight: 800; }
                .back-btn { background: #eee; color: #333; border: 1px solid #ddd; border-radius: 12px; padding: 8px 16px; cursor: pointer; font-weight: 700; transition: 0.3s; }
                .back-btn:hover { background: #e0e0e0; }
                
                .card { width: 100%; max-width: 1100px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(14px); border-radius: 28px; padding: 26px; box-shadow: 0 25px 70px rgba(0, 0, 0, .08); }
                .mt-20 { margin-top: 20px; }
                
                .billing-widget {
                    width: 100%; 
                    max-width: 1100px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .billing-stats { background: #fffcf2; border: 2px solid #ffedab; border-radius: 24px; padding: 25px; box-shadow: 0 10px 30px rgba(255, 193, 7, 0.15); display: flex; flex-direction: column; justify-content: center; }
                .billing-stats h3 { color: #856404; font-size: 18px; margin-bottom: 10px; }
                .billing-stats .amount { font-size: 42px; font-weight: 900; color: #b58900; margin-bottom: 20px; }
                
                .billing-stats.empty { background: #f8f9fa; border: 1px dashed #ccc; min-height: 200px; }
                .billing-stats.error { border-color: #ffcccc; background: #fff5f5; }
                .billing-stats.error button { margin-top: 10px; background: #999; color: white; border: none; padding: 5px 12px; border-radius: 5px; }
                
                .upi-section { display: flex; align-items: center; background: rgba(255,255,255,0.7); padding: 12px 18px; border-radius: 12px; gap: 10px; font-size: 15px; flex-wrap: wrap; }
                .upi-label { color: #555; }
                .upi-id { font-weight: 700; color: #333; background: #eee; padding: 4px 10px; border-radius: 6px; }
                .upi-error { color: #d9534f; font-weight: 600; font-style: italic; }
                .copy-btn { padding: 8px 14px; border-radius: 10px; border: none; background: #0bb15d; color: white; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 10px rgba(11, 177, 93, 0.3); }
                
                .payment-form { background: white; border-radius: 24px; padding: 25px; box-shadow: 0 15px 40px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: center; border: 1px solid #f0f0f0; }
                .payment-form h3 { font-size: 20px; color: #333; margin-bottom: 5px; }
                .payment-form p { color: #666; font-size: 14px; margin-bottom: 20px; }
                .error-small { color: #d9534f; font-size: 12px; margin-top: 10px; font-weight: 600; }
                
                .form-payload { display: flex; gap: 10px; flex-wrap: wrap; }
                .form-payload input { flex: 1; padding: 14px; border-radius: 12px; border: 2px solid #eee; font-size: 16px; outline: none; transition: 0.3s; min-width: 150px; }
                .form-payload input:focus { border-color: #0bb15d; }
                .form-payload button { padding: 14px 24px; background: #0bb15d; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 6px 15px rgba(11, 177, 93, 0.3); }
                .form-payload button:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }

                table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; }
                th, td { padding: 16px; text-align: left; border-bottom: 1px solid #eee; }
                th { background: var(--primary-color); color: white; }
                .status { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                .status.pending { background: #fff3cd; color: #856404; }
                .status.paid { background: #d4edda; color: #155724; }

                @media (max-width: 768px) {
                    .billing-widget { grid-template-columns: 1fr; }
                    .billing-stats .amount { font-size: 32px; }
                    .bills-header { flex-direction: column; gap: 15px; align-items: flex-start; }
                }
            `}</style>
        </Layout>
    );
};

export default HotelBills;
