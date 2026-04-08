import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/admin.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    const load = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`);
        setCategories(res.data.categories);
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories/${editingId}`, form, { withCredentials: true });
                setMsg('Category updated!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`, form, { withCredentials: true });
                setMsg('Category created!');
            }
            setForm({ name: '', description: '' });
            setShowForm(false);
            setEditingId(null);
            load();
        } catch (error) {
            setErr(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat._id);
        setForm({ name: cat.name, description: cat.description || '' });
        setShowForm(true);
        setErr(''); setMsg('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/categories/${id}`, { withCredentials: true });
        setMsg('Category deleted.');
        load();
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', description: '' });
        setErr('');
    };

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2>Categories</h2>
                <button className="admin-btn-primary sm" onClick={() => { cancelForm(); setShowForm(!showForm); }}>
                    {showForm ? 'Cancel' : '+ Add Category'}
                </button>
            </div>

            {msg && <p className="admin-success">{msg}</p>}
            {err && <p className="admin-error">{err}</p>}

            {showForm && (
                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="admin-form-row">
                        <div className="admin-field-group">
                            <label>Category Name</label>
                            <input type="text" placeholder="e.g. Desserts" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="admin-field-group" style={{ flex: 2 }}>
                            <label>Description (optional)</label>
                            <input type="text" placeholder="Short description..." value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="admin-btn-primary" type="submit">
                            {editingId ? 'Update Category' : 'Create Category'}
                        </button>
                        {editingId && (
                            <button className="admin-btn-ghost" type="button" onClick={cancelForm}>Cancel Edit</button>
                        )}
                    </div>
                </form>
            )}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 && (
                            <tr><td colSpan={4} className="admin-empty">No categories yet. Add some!</td></tr>
                        )}
                        {categories.map(c => (
                            <tr key={c._id}>
                                <td><span className="admin-badge">{c.name}</span></td>
                                <td>{c.description || '—'}</td>
                                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="admin-actions-cell">
                                    <button className="admin-btn-ghost sm" onClick={() => handleEdit(c)}>Edit</button>
                                    <button className="admin-btn-danger sm" onClick={() => handleDelete(c._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManagement;
