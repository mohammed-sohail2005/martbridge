import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePopup } from '../../context/PopupContext';

const DepartmentLogin = () => {
    const navigate = useNavigate();
    const { showAlert } = usePopup();
    const [formData, setFormData] = useState({ storeName: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/department/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                // The API returns { department: { _id: '...' } }
                const id = data.department?._id;
                if (id) {
                    localStorage.setItem('deptId', id);
                    showAlert('Login Successful!', 'Success');
                    navigate('/department/dashboard');
                } else {
                    showAlert('Login failed: Invalid data from server', 'Error');
                }
            } else {
                showAlert(data.message || 'Invalid credentials', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server connection failed', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="card">
                <div className="brand">MartBridge</div>
                <div className="subtitle">Department Store Login</div>

                <form onSubmit={handleSubmit}>
                    <div className="group">
                        <label>Store Name</label>
                        <input 
                            type="text" 
                            name="storeName" 
                            required 
                            placeholder="Enter Store Name"
                            value={formData.storeName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            required 
                            placeholder="Enter Password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="footer-text">
                    New store? <Link to="/department/register">Register here</Link>
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
            `}</style>
        </div>
    );
};

export default DepartmentLogin;
