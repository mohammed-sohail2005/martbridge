import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { usePopup } from '../../context/PopupContext';
import { useAuth } from '../../hooks/useAuth';

const DepartmentCreateHotel = () => {
    const navigate = useNavigate();
    const { showAlert } = usePopup();
    const { userId: deptId } = useAuth('deptId', '/department/register');
    
    const [formData, setFormData] = useState({
        hotelName: '', ownerName: '', email: '', phone: '', password: '', address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData, storeId: deptId, storeType: 'department' };

        try {
            const res = await fetch('https://powerful-solace-production-4309.up.railway.app/api/hotel/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await showAlert('Hotel User Created Successfully!', 'Success');
                navigate('/department/dashboard');
            } else {
                const result = await res.json();
                showAlert(result.message || 'Creation failed', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error during hotel creation', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="form-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Create Hotel User</h2>
                    <button className="back-btn" onClick={() => navigate('/department/dashboard')}>Back</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input type="text" name="hotelName" required placeholder=" " value={formData.hotelName} onChange={handleInputChange} />
                        <label>Hotel Name</label>
                    </div>
                    <div className="input-group">
                        <input type="text" name="ownerName" required placeholder=" " value={formData.ownerName} onChange={handleInputChange} />
                        <label>Owner Name</label>
                    </div>
                    <div className="input-group">
                        <input type="email" name="email" required placeholder=" " value={formData.email} onChange={handleInputChange} />
                        <label>Email</label>
                    </div>
                    <div className="input-group">
                        <input type="tel" name="phone" required placeholder=" " value={formData.phone} onChange={handleInputChange} />
                        <label>Phone Number</label>
                    </div>
                    <div className="input-group">
                        <input type="password" name="password" required placeholder=" " value={formData.password} onChange={handleInputChange} />
                        <label>Password</label>
                    </div>
                    <div className="input-group">
                        <textarea name="address" required placeholder=" " value={formData.address} onChange={handleInputChange}></textarea>
                        <label>Address</label>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Hotel'}
                    </button>
                </form>
            </div>
            {/* Same styles as Registration */}
            <style jsx="true">{`
                .form-container { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 500px; margin: 20px auto; }
                .back-btn { padding: 8px 16px; background: #f0f2f5; border: none; border-radius: 10px; cursor: pointer; }
                .input-group { position: relative; margin-bottom: 25px; }
                .input-group input, .input-group textarea { width: 100%; padding: 12px 15px; border: 2px solid #eee; border-radius: 12px; outline: none; font-size: 16px; transition: 0.3s; }
                .input-group label { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; transition: 0.3s; pointer-events: none; background: white; padding: 0 5px; }
                .input-group input:focus + label, .input-group input:not(:placeholder-shown) + label, .input-group textarea:focus + label, .input-group textarea:not(:placeholder-shown) + label { top: -10px; font-size: 12px; color: var(--primary-color); font-weight: 600; }
                .submit-btn { width: 100%; padding: 14px; background: var(--primary-color); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; transition: 0.3s; }
            `}</style>
        </Layout>
    );
};

export default DepartmentCreateHotel;
