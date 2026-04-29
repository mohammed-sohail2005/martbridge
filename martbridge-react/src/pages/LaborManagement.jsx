import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePopup } from '../context/PopupContext';
import { API_BASE_URL } from '../apiConfig';
import jsQR from 'jsqr';
import './LaborManagement.css'; // We will create this

const LaborManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert, showConfirm } = usePopup();
    
    // Determine the owner type and ID based on the URL path
    const pathParts = location.pathname.split('/');
    const ownerType = pathParts[1]; // 'hotel', 'department', 'meat', 'vegetable'
    
    let ownerIdParam = `${ownerType}Id`;
    if (ownerType === 'department') ownerIdParam = 'deptId';
    if (ownerType === 'vegetable') ownerIdParam = 'vegId';
    
    // Some endpoints use /login, others use /register as primary auth gateway.
    // For meat, vegetable, department it was /register in useAuth hook default.
    // To be safe, if we get redirected, let's redirect to login.
    const { userId, logout } = useAuth(ownerIdParam, `/${ownerType}/login`);
    
    const [labors, setLabors] = useState([]);
    
    // Labor Form State
    const [laborName, setLaborName] = useState('');
    const [laborSalary, setLaborSalary] = useState('');
    const [laborCategory, setLaborCategory] = useState('General');
    const [isSavingLabor, setIsSavingLabor] = useState(false);
    
    // Edit Form State
    const [editingLaborId, setEditingLaborId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSalary, setEditSalary] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [isUpdatingLabor, setIsUpdatingLabor] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchLabors();
        }
    }, [userId]);

    const fetchLabors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/labor/owner/${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLabors(data);
            }
        } catch (err) {
            console.error("Labor fetch error:", err);
            showAlert('Failed to fetch labor records', 'Error');
        }
    };

    const handleAddLabor = async (e) => {
        e.preventDefault();
        if (!laborName || !laborSalary) {
            showAlert('Please fill all fields', 'Warning');
            return;
        }

        setIsSavingLabor(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/labor/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ownerId: userId,
                    ownerType: ownerType,
                    name: laborName,
                    salary: parseFloat(laborSalary),
                    category: laborCategory
                })
            });

            if (res.ok) {
                setLaborName('');
                setLaborSalary('');
                setLaborCategory('General');
                fetchLabors();
                showAlert('Labor added successfully!', 'Success');
            } else {
                showAlert('Failed to add labor', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error', 'Error');
        } finally {
            setIsSavingLabor(false);
        }
    };

    const handleEditLabor = (labor) => {
        setEditingLaborId(labor._id);
        setEditName(labor.name);
        setEditSalary(labor.salary);
        setEditCategory(labor.category || 'General');
    };

    const handleCancelEdit = () => {
        setEditingLaborId(null);
        setEditName('');
        setEditSalary('');
        setEditCategory('');
    };

    const handleUpdateLabor = async (e) => {
        e.preventDefault();
        if (!editName || !editSalary) {
            showAlert('Please fill all fields', 'Warning');
            return;
        }

        setIsUpdatingLabor(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/labor/${editingLaborId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    salary: parseFloat(editSalary),
                    category: editCategory
                })
            });

            if (res.ok) {
                fetchLabors();
                handleCancelEdit();
                showAlert('Labor updated successfully!', 'Success');
            } else {
                showAlert('Failed to update labor', 'Error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error', 'Error');
        } finally {
            setIsUpdatingLabor(false);
        }
    };

    const handleDeleteLabor = async (id) => {
        const confirmed = await showConfirm('Remove this labor record?', 'Delete');
        if (confirmed) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/labor/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchLabors();
                } else {
                    showAlert('Failed to delete labor', 'Error');
                }
            } catch (err) {
                console.error(err);
                showAlert('Server error', 'Error');
            }
        }
    };

    const handleQRUpload = (e, laborId) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                
                // Process the image using jsQR
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    const upiLink = code.data;
                    
                    if (!upiLink.toLowerCase().startsWith('upi://')) {
                        showAlert("The uploaded QR code does not appear to be a valid UPI QR code.", "Warning");
                        return;
                    }

                    // Update labor record with UPI link
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/labor/${laborId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ upiLink })
                        });
                        if (res.ok) {
                            fetchLabors();
                            showAlert('UPI QR Code processed successfully!', 'Success');
                        } else {
                            showAlert('Failed to save UPI link', 'Error');
                        }
                    } catch (err) {
                        console.error(err);
                        showAlert('Server error', 'Error');
                    }
                } else {
                    showAlert("No QR code found in the image. Please try a clearer image.", "Warning");
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        
        // Reset file input so same file can be uploaded again if needed
        e.target.value = '';
    };

    const totalMonthlySalary = labors.reduce((sum, l) => sum + (l.salary || 0), 0);

    const categories = Array.from(new Set(labors.map(l => l.category || 'General')));
    if (categories.length === 0) categories.push('General');

    return (
        <div className="labor-mgmt-page">
            <button className="back-btn" onClick={() => navigate(`/${ownerType}/dashboard`)}>← Back to Dashboard</button>

            <div className="labor-mgmt-container">
                <div className="labor-header">
                    <h1>👷 Labor Management</h1>
                    <p>Manage monthly salaries, edit records, and setup UPI payments for your staff.</p>
                </div>

                <div className="labor-content">
                    <div className="add-labor-section">
                        <h2>Add New Staff</h2>
                        <form className="labor-form" onSubmit={handleAddLabor}>
                            <input type="text" placeholder="Worker Name" value={laborName} onChange={e => setLaborName(e.target.value)} required />
                            <input type="number" placeholder="Monthly Salary (₹)" value={laborSalary} onChange={e => setLaborSalary(e.target.value)} required />
                            {ownerType === 'hotel' ? (
                                <select value={laborCategory} onChange={e => setLaborCategory(e.target.value)}>
                                    <option value="Cooking Master">Cooking Master</option>
                                    <option value="Server">Server</option>
                                    <option value="Cleaner">Cleaner</option>
                                    <option value="General">General</option>
                                </select>
                            ) : (
                                <input type="text" placeholder="Category / Role" value={laborCategory} onChange={e => setLaborCategory(e.target.value)} />
                            )}
                            <button type="submit" className="primary-btn" disabled={isSavingLabor}>
                                {isSavingLabor ? 'Saving...' : 'Add Record'}
                            </button>
                        </form>
                    </div>

                    <div className="labor-list-section">
                        <div className="list-header">
                            <h2>Staff Records</h2>
                            <div className="total-badge">Total Monthly: <span>₹{totalMonthlySalary}</span></div>
                        </div>

                        {labors.length === 0 ? (
                            <div className="empty-state">No labor records found. Start adding your staff above.</div>
                        ) : (
                            categories.map(cat => (
                                <div key={cat} className="category-group">
                                    <h3>{cat}</h3>
                                    <div className="labor-cards-grid">
                                        {labors.filter(l => (l.category || 'General') === cat).map(labor => (
                                            <div key={labor._id} className="labor-card-full">
                                                {editingLaborId === labor._id ? (
                                                    <form className="edit-labor-form" onSubmit={handleUpdateLabor}>
                                                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
                                                        <input type="number" value={editSalary} onChange={e => setEditSalary(e.target.value)} required />
                                                        <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} />
                                                        <div className="edit-actions">
                                                            <button type="submit" className="save-btn" disabled={isUpdatingLabor}>Save</button>
                                                            <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="labor-card-header">
                                                            <div className="labor-info">
                                                                <h4>{labor.name}</h4>
                                                                <span className="salary">₹{labor.salary} / month</span>
                                                            </div>
                                                            <div className="labor-actions">
                                                                <button onClick={() => handleEditLabor(labor)} className="icon-btn edit" title="Edit">✏️</button>
                                                                <button onClick={() => handleDeleteLabor(labor._id)} className="icon-btn delete" title="Delete">🗑️</button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="labor-card-footer">
                                                            <div className="upi-section">
                                                                {labor.upiLink ? (
                                                                    <div className="upi-ready">
                                                                        <a href={labor.upiLink} className="pay-btn" target="_blank" rel="noopener noreferrer">
                                                                            Pay via UPI
                                                                        </a>
                                                                        <label className="reupload-btn">
                                                                            <input type="file" accept="image/*" onChange={(e) => handleQRUpload(e, labor._id)} hidden />
                                                                            Change QR
                                                                        </label>
                                                                    </div>
                                                                ) : (
                                                                    <label className="upload-qr-btn">
                                                                        <input type="file" accept="image/*" onChange={(e) => handleQRUpload(e, labor._id)} hidden />
                                                                        📷 Upload UPI QR
                                                                    </label>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaborManagement;
