import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePopup } from '../../context/PopupContext';
import Layout from '../../components/Layout';
import { API_BASE_URL } from '../../apiConfig';

const MeatSetPrices = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = usePopup();
    const { userId: meatId } = useAuth('meatId', '/meat/register');
    
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ name: '', price: '', unit: 'kg' });
    const [editId, setEditId] = useState(null);
    const [storeName, setStoreName] = useState('Unknown Store');

    useEffect(() => {
        if (meatId) {
            fetchStoreDetails();
            fetchProducts();
        }
    }, [meatId]);

    const fetchStoreDetails = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/meat/${meatId}`);
            const data = await res.json();
            if (data.storeName) setStoreName(data.storeName);
        } catch (e) {
            console.error("Failed to fetch store name", e);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/product/store/${meatId}`);
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, price } = formData;

        if (!name || !price) {
            showAlert("Please enter Item Name and Price", "Missing Info");
            return;
        }

        const payload = {
            storeId: meatId,
            storeName,
            name,
            price,
            unit
        };

        try {
            const endpoint = editId ? `${API_BASE_URL}/api/product/${editId}` : "${API_BASE_URL}/api/product/add";
            const method = editId ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setFormData({ name: '', price: '', unit: 'kg' });
                setEditId(null);
                fetchProducts();
            } else {
                const data = await res.json();
                showAlert(data.message || "Error saving product", "Error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Server error", "Error");
        }
    };

    const handleEdit = (item) => {
        setFormData({ name: item.name, price: item.price, unit: item.unit || 'kg' });
        setEditId(item._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        const confirmDelete = await showConfirm("Are you sure you want to delete this item?", "Delete Item?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/product/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchProducts();
            } else {
                showAlert("Failed to delete item", "Error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Server error", "Error");
        }
    };

    return (
        <Layout>
            <div className="set-prices-header">
                <h1>🥩 Today's Meat Prices</h1>
                <button className="back-btn" onClick={() => navigate('/meat/dashboard')}>← Back</button>
            </div>

            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Item name (Chicken, Mutton...)" required />
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Price (₹)" required />
                    <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} placeholder="Unit (kg, pkt, etc.)" style={{ maxWidth: '120px' }} required />
                    <button type="submit">{editId ? 'Update Item' : 'Add Item'}</button>
                </form>

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr><th>Item Name</th><th>Price (₹)</th><th>Unit</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td><b>{item.name}</b></td>
                                    <td><span className="price">₹ {item.price}</span></td>
                                    <td><span className="unit-tag">{item.unit || 'kg'}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="del-btn edit" onClick={() => handleEdit(item)}>Edit</button>
                                            <button className="del-btn delete" onClick={() => handleDelete(item._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx="true">{`
                .set-prices-header { width: 100%; max-width: 1100px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border-radius: 22px; padding: 18px 22px; box-shadow: 0 12px 35px rgba(0, 0, 0, .08); }
                .set-prices-header h1 { color: var(--primary-color); font-size: 22px; font-weight: 800; }
                .back-btn { background: linear-gradient(135deg, var(--primary-color), #18e187); color: white; border: none; border-radius: 30px; padding: 10px 18px; cursor: pointer; font-weight: 700; box-shadow: 0 6px 18px rgba(11, 177, 93, .35); }
                .card { width: 100%; max-width: 1100px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(14px); border-radius: 28px; padding: 26px; box-shadow: 0 25px 70px rgba(0, 0, 0, .08); }
                .form { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 28px; }
                .form input { flex: 1; min-width: 200px; padding: 14px 16px; border-radius: 16px; border: 1px solid #d9f3e6; outline: none; font-size: 15px; background: #f7fffb; }
                .form button { padding: 14px 26px; border: none; border-radius: 30px; background: linear-gradient(135deg, var(--primary-color), #18e187); color: white; font-weight: 800; cursor: pointer; }
                table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; }
                th, td { padding: 16px; text-align: left; border-bottom: 1px solid #eee; }
                th { background: var(--primary-color); color: white; }
                .price { color: var(--primary-color); font-weight: 800; font-size: 18px; }
                .unit-tag { background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 12px; text-transform: lowercase; }
                .del-btn { color: white; border: none; border-radius: 14px; padding: 8px 12px; cursor: pointer; font-size: 12px; }
                .del-btn.edit { background: var(--primary-color); }
                .del-btn.delete { background: #ff4d4d; }
                
                @media (max-width: 768px) {
                    .set-prices-header { flex-direction: column; gap: 15px; text-align: center; padding: 15px; }
                    .set-prices-header h1 { font-size: 18px; }
                    .card { padding: 15px; border-radius: 20px; }
                    .form { flex-direction: column; gap: 10px; }
                    .form input { min-width: 100%; }
                    th, td { padding: 10px; font-size: 13px; }
                    .price { font-size: 15px; }
                }
            `}</style>
        </Layout>
    );
};

export default MeatSetPrices;
