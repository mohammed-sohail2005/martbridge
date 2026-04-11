import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { usePopup } from '../../context/PopupContext';

const AdminDashboard = () => {
    const { showAlert, showConfirm } = usePopup();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const sections = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'department', label: 'Department Stores', icon: '🏬' },
        { id: 'meat', label: 'Meat Shops', icon: '🥩' },
        { id: 'vegetable', label: 'Vegetable Shops', icon: '🥬' },
        { id: 'catering', label: 'Catering Agents', icon: '🍽' },
    ];

    useEffect(() => {
        if (activeSection !== 'dashboard' && activeSection !== 'catering') {
            fetchData(activeSection);
        }
    }, [activeSection]);

    const fetchData = async (type) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/admin/${type}`);
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
            showAlert('Error loading data', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        const confirmed = await showConfirm('Are you sure you want to delete this store?', 'Confirm Delete');
        if (confirmed) {
            try {
                const res = await fetch(`http://localhost:5000/api/admin/${type}/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setData(data.filter(item => item._id !== id));
                    showAlert('Deleted successfully', 'Success');
                } else {
                    showAlert('Failed to delete', 'Error');
                }
            } catch (err) {
                console.error(err);
                showAlert('Server error', 'Error');
            }
        }
    };

    const renderDashboard = () => (
        <div className="grid">
            {sections.slice(1).map(section => (
                <div key={section.id} className="card" onClick={() => setActiveSection(section.id)}>
                    <div className="card-img" style={{ background: `linear-gradient(45deg, var(--primary-color), var(--secondary-color))` }}>
                        <span style={{ fontSize: '48px' }}>{section.icon}</span>
                    </div>
                    <div className="card-content">
                        <h3>{section.label}</h3>
                        <p>Manage registered {section.label.toLowerCase()}.</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTable = (type) => (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Owner</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No records found.</td></tr>
                    ) : (
                        data.map(item => (
                            <tr key={item._id}>
                                <td><b>{item.storeName || item.hotelName}</b></td>
                                <td>{item.ownerName}</td>
                                <td>{item.phone}</td>
                                <td>{item.address || item.location}</td>
                                <td>
                                    <button className="btn view-btn" onClick={() => { setSelectedItem(item); setShowModal(true); }}>View</button>
                                    <button className="btn delete-btn" onClick={() => handleDelete(item._id, type)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-layout">
            <div className="sidebar">
                <div className="brand">🛠 MartBridge</div>
                {sections.map(section => (
                    <div 
                        key={section.id} 
                        className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                    >
                        <span className="nav-icon">{section.icon}</span> {section.label}
                    </div>
                ))}
            </div>

            <div className="main">
                <h1>{sections.find(s => s.id === activeSection).label}</h1>
                <p className="subtitle">Manage all business profiles and data.</p>

                {activeSection === 'dashboard' && renderDashboard()}
                {activeSection === 'catering' && (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <span style={{ fontSize: '64px' }}>🍽</span>
                        <h2>Catering Module</h2>
                        <p>This feature is currently under development.</p>
                    </div>
                )}
                {(activeSection !== 'dashboard' && activeSection !== 'catering') && renderTable(activeSection)}
            </div>

            {showModal && selectedItem && (
                <div className="modal-overlay active" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Details</h2>
                        <img src={selectedItem.profileImage || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="profile-img" alt="profile" />
                        <div className="detail-row"><span className="detail-label">Name:</span> <span className="detail-value">{selectedItem.storeName || selectedItem.hotelName}</span></div>
                        <div className="detail-row"><span className="detail-label">Owner:</span> <span className="detail-value">{selectedItem.ownerName}</span></div>
                        <div className="detail-row"><span className="detail-label">Phone:</span> <span className="detail-value">{selectedItem.phone}</span></div>
                        <div className="detail-row"><span className="detail-label">Email:</span> <span className="detail-value">{selectedItem.email}</span></div>
                        <div className="detail-row"><span className="detail-label">Address:</span> <span className="detail-value">{selectedItem.address || selectedItem.location}</span></div>
                        <button className="modal-btn btn-green" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .admin-layout { display: flex; min-height: 100vh; background: #f6fffb; }
                .sidebar { width: 260px; background: white; height: 100vh; position: fixed; left: 0; top: 0; padding: 30px 20px; box-shadow: 4px 0 20px rgba(0,0,0,0.05); z-index: 100; display: flex; flex-direction: column; }
                .brand { font-size: 22px; font-weight: 700; color: var(--primary-color); margin-bottom: 40px; }
                .nav-item { padding: 14px 18px; margin-bottom: 8px; border-radius: 12px; cursor: pointer; color: #666; font-weight: 500; transition: .3s; display: flex; align-items: center; gap: 12px; }
                .nav-item:hover, .nav-item.active { background: #eafff3; color: var(--primary-color); }
                .main { margin-left: 260px; flex: 1; padding: 40px; }
                h1 { font-size: 28px; margin-bottom: 10px; color: #333; }
                .subtitle { color: #777; margin-bottom: 30px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
                .card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05); cursor: pointer; transition: .3s; }
                .card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(11, 177, 93, 0.15); }
                .card-img { width: 100%; height: 160px; display: flex; justify-content: center; align-items: center; color: white; }
                .card-content { padding: 20px; }
                .table-container { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 5px 30px rgba(0,0,0,0.03); overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; min-width: 600px; }
                th, td { padding: 16px; text-align: left; border-bottom: 1px solid #f0f0f0; }
                th { font-size: 13px; text-transform: uppercase; color: var(--primary-color); }
                .btn { padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; margin-right: 6px; }
                .view-btn { background: #e8f5e9; color: var(--primary-color); }
                .delete-btn { background: #ffecec; color: #d94242; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal { background: white; width: 90%; max-width: 450px; border-radius: 20px; padding: 30px; text-align: center; }
                .profile-img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 20px; border: 3px solid var(--primary-color); }
                .detail-row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0; font-size: 14px; }
                .detail-label { font-weight: 600; color: #555; }
                .modal-btn { padding: 10px 24px; border-radius: 12px; border: none; font-weight: 600; cursor: pointer; margin-top: 20px; }
                .btn-green { background: var(--primary-color); color: white; }

                @media (max-width: 1024px) {
                    .sidebar { width: 100%; height: auto; position: sticky; flex-direction: row; overflow-x: auto; padding: 15px; gap: 10px; }
                    .brand { margin-bottom: 0; padding-right: 20px; font-size: 18px; border-right: 1px solid #eee; margin-right: 10px; }
                    .nav-item { margin-bottom: 0; white-space: nowrap; padding: 10px 15px; font-size: 13px; }
                    .main { margin-left: 0; padding: 20px; }
                    h1 { font-size: 22px; }
                    .grid { grid-template-columns: 1fr; gap: 15px; }
                    .card { height: auto; display: flex; align-items: center; }
                    .card-img { width: 100px; height: 100px; }
                    .card-content { flex: 1; }
                    .table-container { padding: 10px; border-radius: 12px; }
                    table { min-width: 100%; }
                    th, td { padding: 12px 8px; font-size: 12px; }
                    .btn { padding: 4px 8px; font-size: 11px; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
