import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../../styles/admin.css';

const ShopInventoryManagement = () => {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ title: '', description: '', price: '', stock: '', productId: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [fileError, setFileError] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const fetchItems = () => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/shop/items`, { withCredentials: true })
            .then(res => setItems(res.data.items))
            .catch(() => {});
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        if (!imageFile) { setImageURL(''); return; }
        const url = URL.createObjectURL(imageFile);
        setImageURL(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) { setImageFile(null); setFileError(''); return; }
        if (!file.type.startsWith('image/')) { setFileError('Please select a valid image file.'); return; }
        setFileError('');
        setImageFile(file);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this shop item?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/shop/admin/items/${id}`, { withCredentials: true });
            fetchItems();
        } catch (error) {
            alert("Failed to delete item");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        if (!imageFile) { setFileError('Please upload a product image.'); return; }

        setIsSubmitting(true);
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('price', form.price);
        fd.append('stock', form.stock);
        fd.append('productId', form.productId);
        fd.append('image', imageFile);

        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/shop/admin/items`, fd, { withCredentials: true });
            setMsg('Shop item added successfully!');
            setForm({ title: '', description: '', price: '', stock: '', productId: '' });
            setImageFile(null);
            fetchItems();
        } catch (error) {
            setErr(error.response?.data?.message || 'Error creating shop item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDisabled = !form.title.trim() || !form.price || !form.productId || !imageFile || isSubmitting;

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2>Add New Product to Shop</h2>
            </div>

            {msg && <p className="admin-success">{msg}</p>}
            {err && <p className="admin-error">{err}</p>}

            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form-row">
                    <div className="admin-field-group">
                        <label>Product Image</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={onFileChange}
                        />
                        <div
                            className="admin-dropzone"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imageFile ? (
                                <div className="admin-dropzone-file">
                                    <span className="admin-dropzone-icon">🖼️</span>
                                    <span>{imageFile.name}</span>
                                    <button type="button" className="admin-btn-ghost sm" style={{ marginLeft: 'auto' }}
                                        onClick={(e) => { e.stopPropagation(); setImageFile(null); }}>Remove</button>
                                </div>
                            ) : (
                                <div className="admin-dropzone-empty" style={{ padding: '16px', minHeight: '60px' }}>
                                    <span>🖼️ Click to upload image</span>
                                </div>
                            )}
                        </div>
                        {fileError && <p className="admin-error">{fileError}</p>}
                    </div>

                    {imageURL && (
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                            <img src={imageURL} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                </div>

                <div className="admin-form-row">
                    <div className="admin-field-group">
                        <label>Title</label>
                        <input type="text" placeholder="e.g. Nexus Energy Drink"
                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="admin-field-group">
                        <label>Price (₹)</label>
                        <input type="number" placeholder="499" min="0"
                            value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div className="admin-field-group">
                        <label>Stock Quantity</label>
                        <input type="number" placeholder="100" min="0"
                            value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                    </div>
                    <div className="admin-field-group">
                        <label>Unique Product ID</label>
                        <input type="text" placeholder="SKU-1234"
                            value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required />
                    </div>
                </div>

                <div className="admin-field-group">
                    <label>Description</label>
                    <textarea placeholder="Describe the product..." rows="2"
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                </div>

                <button className="admin-btn-primary" type="submit" disabled={isDisabled} style={{ width: 'auto' }}>
                    {isSubmitting ? 'Adding…' : 'Add Product'}
                </button>
            </form>

            <div className="admin-section-header" style={{ marginTop: '20px' }}>
                <h2>Inventory</h2>
            </div>
            
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title & ID</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan="5" className="admin-empty">No products in shop.</td></tr>
                        ) : (items.map(i => (
                            <tr key={i._id}>
                                <td>
                                    <img src={i.image} alt={i.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td>
                                    <b>{i.title}</b><br/>
                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{i.productId}</span>
                                </td>
                                <td>₹{i.price}</td>
                                <td>{i.stock}</td>
                                <td>
                                    <div className="admin-actions-cell">
                                        <button className="admin-btn-danger sm" onClick={() => handleDelete(i._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShopInventoryManagement;
