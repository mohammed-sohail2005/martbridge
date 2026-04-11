import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { usePopup } from '../../context/PopupContext';

const MeatRegister = () => {
    const navigate = useNavigate();
    const { showAlert } = usePopup();
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        upi: '',
        phone: '',
        password: '',
        address: '',
        profileImage: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result });
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/meat/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();

            if (res.ok) {
                localStorage.setItem('meatId', result.meat._id);
                await showAlert('Meat Store Registration Successful!', 'Success');
                navigate('/meat/dashboard');
            } else {
                showAlert(result.message || result.error || 'Registration failed', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error during registration', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="form-container">
                <h2>Meat Shop Registration</h2>
                <form onSubmit={handleSubmit}>
                    <div className="profile-picker-container">
                        <label htmlFor="profileImage" className="profile-picker">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" />
                            ) : (
                                <div className="placeholder">
                                    <span className="camera-icon">📷</span>
                                    <span>Add Image</span>
                                </div>
                            )}
                        </label>
                        <input 
                            type="file" 
                            id="profileImage" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }}
                        />
                        <p className="optional-text">(Optional)</p>
                    </div>

                    <div className="input-group">
                        <input type="text" name="storeName" required placeholder=" " value={formData.storeName} onChange={handleInputChange} />
                        <label>Store Name</label>
                    </div>
                    {/* Reuse same styling as VegetableRegister */}
                    <div className="input-group">
                        <input type="text" name="ownerName" required placeholder=" " value={formData.ownerName} onChange={handleInputChange} />
                        <label>Owner Name</label>
                    </div>
                    <div className="input-group">
                        <input type="text" name="upi" required placeholder=" " value={formData.upi} onChange={handleInputChange} />
                        <label>UPI ID</label>
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
                        <label>Store Address</label>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Register Store'}
                    </button>
                    <p className="switch-link" onClick={() => navigate('/meat/login')}>
                        Already registered? Login here
                    </p>
                </form>
            </div>

            <style jsx="true">{`
                .form-container {
                    background: white;
                    padding: 40px;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    width: 100%;
                    max-width: 500px;
                    margin: 20px auto;
                }
                .form-container h2 {
                    margin-bottom: 20px;
                    color: var(--primary-color);
                    text-align: center;
                }

                .profile-picker-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
                .profile-picker { width: 120px; height: 120px; border-radius: 50%; border: 3px dashed #ddd; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; transition: 0.3s; background: #fafafa; }
                .profile-picker:hover { border-color: var(--primary-color); background: #f0f7f4; }
                .profile-picker img { width: 100%; height: 100%; object-fit: cover; }
                .profile-picker .placeholder { display: flex; flex-direction: column; align-items: center; color: #999; font-size: 13px; }
                .profile-picker .camera-icon { font-size: 24px; margin-bottom: 4px; }
                .optional-text { font-size: 12px; color: #999; margin-top: 8px; }

                .input-group {
                    position: relative;
                    margin-bottom: 25px;
                }
                .input-group input, .input-group textarea {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #eee;
                    border-radius: 12px;
                    outline: none;
                    font-size: 16px;
                    transition: 0.3s;
                }
                .input-group textarea { height: 100px; resize: none; }
                .input-group input:focus, .input-group textarea:focus { border-color: var(--primary-color); }
                .input-group label {
                    position: absolute;
                    left: 15px;
                    top: 12px;
                    transform: none;
                    color: #999;
                    transition: 0.3s;
                    pointer-events: none;
                    background: white;
                    padding: 0 5px;
                }
                .input-group input:focus + label, .input-group input:not(:placeholder-shown) + label,
                .input-group textarea:focus + label, .input-group textarea:not(:placeholder-shown) + label {
                    top: -10px;
                    font-size: 12px;
                    color: var(--primary-color);
                    font-weight: 600;
                }
                
                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    transition: 0.3s;
                }
                .submit-btn:hover { background: var(--primary-dark); transform: translateY(-2px); }
                .submit-btn:disabled { background: #ccc; cursor: not-allowed; }
                .switch-link {
                    text-align: center;
                    margin-top: 20px;
                    color: var(--secondary-color);
                    cursor: pointer;
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .form-container { padding: 25px 20px; border-radius: 16px; margin: 10px auto; }
                    .form-container h2 { font-size: 20px; margin-bottom: 20px; }
                    .input-group { margin-bottom: 20px; }
                    .input-group input, .input-group textarea { padding: 10px 12px; font-size: 15px; }
                }
            `}</style>
        </Layout>
    );
};

export default MeatRegister;
