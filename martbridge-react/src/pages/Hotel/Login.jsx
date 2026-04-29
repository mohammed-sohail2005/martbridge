import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePopup } from '../../context/PopupContext';

const HotelLogin = () => {
    const navigate = useNavigate();
    const { showAlert } = usePopup();
    const [formData, setFormData] = useState({ hotelName: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('https://powerful-solace-production-4309.up.railway.app/api/hotel/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok && data.message === "Login successful") {
                const id = data.hotelId || (data.hotel && data.hotel._id);
                if (id) {
                    localStorage.setItem("hotelId", id);
                    if (data.token) localStorage.setItem("hotelToken", data.token);
                    navigate('/hotel/dashboard');
                } else {
                    showAlert("Login failed: ID missing from server response", "Error");
                }
            } else {
                showAlert(data.message || "Invalid credentials", "Error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Server connection failed", "Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="card">
                <div className="brand">MartBridge</div>
                <div className="subtitle">Hotel Partner Login</div>

                <form onSubmit={handleSubmit}>
                    <div className="group">
                        <label>Hotel Name</label>
                        <input 
                            type="text" 
                            name="hotelName" 
                            required 
                            placeholder="Enter Hotel Name"
                            value={formData.hotelName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            required 
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>

                <div className="footer-text">
                    For registration, please contact your<br/>linked Department Store.
                </div>
                <div className="footer-text" style={{ marginTop: '10px' }}>
                    <Link to="/">Back to Home</Link>
                </div>
            </div>

            <style jsx="true">{`
                .login-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #eafff3, #f4fffb);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                .card {
                    width: 100%;
                    max-width: 400px;
                    background: white;
                    border-radius: 24px;
                    padding: 40px 30px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, .08);
                    text-align: center;
                }
                .brand { font-size: 26px; font-weight: 800; color: #0bb15d; }
                .subtitle { color: #4a7c63; font-size: 14px; margin: 8px 0 30px; }
                .group { text-align: left; margin-bottom: 20px; }
                .group label { font-size: 12px; color: #4a7c63; margin-bottom: 6px; display: block; }
                .group input {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    border: 1px solid #d9f3e6;
                    font-size: 14px;
                    outline: none;
                    background: #f9fbf9;
                    transition: .3s;
                }
                .group input:focus { border-color: #0bb15d; background: white; box-shadow: 0 0 0 4px rgba(11, 177, 93, .1); }
                button {
                    width: 100%;
                    margin-top: 10px;
                    padding: 14px;
                    border: none;
                    border-radius: 30px;
                    background: linear-gradient(135deg, #0bb15d, #14d87a);
                    color: white;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: .3s;
                }
                button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(11, 177, 93, .2); }
                button:disabled { background: #ccc; cursor: not-allowed; }
                .footer-text { margin-top: 20px; font-size: 13px; color: #6fa58a; }
                .footer-text a { color: #0bb15d; text-decoration: none; font-weight: 600; }

                @media (max-width: 768px) {
                    .card { padding: 30px 20px; border-radius: 16px; margin: 10px; }
                    .brand { font-size: 22px; }
                    .subtitle { font-size: 13px; margin-bottom: 20px; }
                    .group input { padding: 12px; }
                    button { padding: 12px; font-size: 15px; }
                }
            `}</style>
        </div>
    );
};

export default HotelLogin;
