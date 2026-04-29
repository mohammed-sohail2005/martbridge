import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';
import Layout from '../../components/Layout';

const HotelProfileUpdate = () => {
    const navigate = useNavigate();
    const { showAlert } = usePopup();
    const { userId: hotelId } = useAuth('hotelId', '/hotel/login');
    
    const [formData, setFormData] = useState({
        hotelName: '', ownerName: '', email: '', phone: '', password: '', address: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (hotelId) {
            fetch(`https://powerful-solace-production-4309.up.railway.app/api/hotel/${hotelId}`)
                .then(res => res.json())
                .then(data => {
                    setFormData({
                        hotelName: data.hotelName || '',
                        ownerName: data.ownerName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        password: data.password || '',
                        password: data.password || '',
                        address: data.address || ''
                    });
                    if (data.profileImage) {
                        setPreviewImage(data.profileImage);
                    }
                })
                .catch(err => {
                    console.error(err);
                    showAlert('Failed to load profile data', 'Error');
                });
        }
    }, [hotelId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (profileImage) data.append('profileImage', profileImage);

        try {
            const res = await fetch(`https://powerful-solace-production-4309.up.railway.app/api/hotel/update/${hotelId}`, {
                method: 'PUT',
                body: data
            });

            if (res.ok) {
                await showAlert('Profile Updated Successfully!', 'Success');
                navigate('/hotel/dashboard');
            } else {
                const result = await res.json();
                showAlert(result.message || 'Update failed', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error during update', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="form-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Update Hotel Profile</h2>
                    <button className="back-btn" onClick={() => navigate('/hotel/dashboard')}>Back</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="profile-upload-section">
                        <div className="image-preview-circle">
                            <img src={previewImage || 'https://st3.depositphotos.com/15648834/17930/v/450/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg'} alt="Profile Preview" />
                            <div className="upload-overlay">
                                <span>📷</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden-file-input" />
                        </div>
                        <p className="upload-instruction">Click to change profile photo</p>
                    </div>

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
                        <input type={showPassword ? "text" : "password"} name="password" required placeholder=" " value={formData.password} onChange={handleInputChange} />
                        <label>Password</label>
                        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                        </span>
                    </div>
                    <div className="input-group">
                        <textarea name="address" required placeholder=" " value={formData.address} onChange={handleInputChange}></textarea>
                        <label>Hotel Address</label>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
            <style jsx="true">{`
                .form-container { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 500px; margin: 20px auto; }
                .back-btn { padding: 8px 16px; background: #f0f2f5; border: none; border-radius: 10px; cursor: pointer; }
                
                .form-container h2 { color: var(--primary-color); font-size: 1.5rem; }

                .profile-upload-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
                .image-preview-circle { width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--primary-color); position: relative; overflow: hidden; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
                .image-preview-circle img { width: 100%; height: 100%; object-fit: cover; }
                .upload-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; opacity: 0; transition: 0.3s; }
                .image-preview-circle:hover .upload-overlay { opacity: 1; }
                .upload-overlay span { font-size: 24px; color: white; }
                .hidden-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; height: 100%; width: 100%; z-index: 10; }
                .upload-instruction { margin-top: 10px; font-size: 13px; color: #666; }

                .input-group { position: relative; margin-bottom: 25px; }
                .input-group input, .input-group textarea { width: 100%; padding: 12px 15px; border: 2px solid #eee; border-radius: 12px; outline: none; font-size: 16px; }
                .input-group label { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; background: white; padding: 0 5px; transition: 0.3s; pointer-events: none; }
                .input-group input:focus + label, .input-group input:not(:placeholder-shown) + label, .input-group textarea:focus + label, .input-group textarea:not(:placeholder-shown) + label { top: -10px; font-size: 12px; color: var(--primary-color); }
                .password-toggle { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; user-select: none; opacity: 0.7; }
                .submit-btn { width: 100%; padding: 14px; background: var(--primary-color); color: white; border: none; border-radius: 14px; font-weight: 700; cursor: pointer; }
            `}</style>
        </Layout>
    );
};

export default HotelProfileUpdate;
