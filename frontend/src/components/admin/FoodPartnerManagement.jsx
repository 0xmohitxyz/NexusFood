import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/admin.css';

const FoodPartnerManagement = () => {
    const [partners, setPartners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', contactName: '', phone: '', address: '', email: '', password: '' });
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    const load = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/food-partners`, { withCredentials: true });
        setPartners(res.data.partners);
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/food-partners`, form, { withCredentials: true });
            setMsg('Food partner created successfully!');
            setForm({ name: '', contactName: '', phone: '', address: '', email: '', password: '' });
            setShowForm(false);
            load();
        } catch (error) {
            setErr(error.response?.data?.message || 'Error creating food partner');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this food partner?')) return;
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/food-partners/${id}`, { withCredentials: true });
        setMsg('Food partner deleted.');
        load();
    };

    const field = (key, label, type = 'text', placeholder = '') => (
        <div className="admin-field-group">
            <label>{label}</label>
            <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })} required />
        </div>
    );

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2>Food Partners</h2>
                <button className="admin-btn-primary sm" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Partner'}
                </button>
            </div>

            {msg && <p className="admin-success">{msg}</p>}
            {err && <p className="admin-error">{err}</p>}

            {showForm && (
                <form className="admin-form" onSubmit={handleCreate}>
                    <div className="admin-form-row">
                        {field('name', 'Business Name', 'text', 'e.g. Tasty Bites')}
                        {field('contactName', 'Contact Person', 'text', 'John Doe')}
                        {field('phone', 'Phone', 'text', '+91 9876543210')}
                    </div>
                    <div className="admin-form-row">
                        {field('address', 'Address', 'text', '123 Main St, City')}
                        {field('email', 'Email', 'email', 'partner@email.com')}
                        {field('password', 'Password', 'password', 'Min. 6 chars')}
                    </div>
                    <button className="admin-btn-primary" type="submit">Create Food Partner</button>
                </form>
            )}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Business</th>
                            <th>Contact</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.length === 0 && (
                            <tr><td colSpan={5} className="admin-empty">No food partners found</td></tr>
                        )}
                        {partners.map(p => (
                            <tr key={p._id}>
                                <td>{p.name}</td>
                                <td>{p.contactName}</td>
                                <td>{p.phone}</td>
                                <td>{p.email}</td>
                                <td>
                                    <button className="admin-btn-danger sm" onClick={() => handleDelete(p._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FoodPartnerManagement;
