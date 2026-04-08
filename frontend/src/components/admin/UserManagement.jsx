import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/admin.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    const load = async () => {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, { withCredentials: true });
        setUsers(res.data.users);
        setLoaded(true);
    };

    React.useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, form, { withCredentials: true });
            setMsg('User created successfully!');
            setForm({ fullName: '', email: '', password: '' });
            setShowForm(false);
            load();
        } catch (error) {
            setErr(error.response?.data?.message || 'Error creating user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return;
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${id}`, { withCredentials: true });
        setMsg('User deleted.');
        load();
    };

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2>Users</h2>
                <button className="admin-btn-primary sm" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add User'}
                </button>
            </div>

            {msg && <p className="admin-success">{msg}</p>}
            {err && <p className="admin-error">{err}</p>}

            {showForm && (
                <form className="admin-form" onSubmit={handleCreate}>
                    <div className="admin-form-row">
                        <div className="admin-field-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="John Doe" value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                        </div>
                        <div className="admin-field-group">
                            <label>Email</label>
                            <input type="email" placeholder="john@example.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="admin-field-group">
                            <label>Password</label>
                            <input type="password" placeholder="Min. 6 chars" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                    </div>
                    <button className="admin-btn-primary" type="submit">Create User</button>
                </form>
            )}

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr><td colSpan={4} className="admin-empty">No users found</td></tr>
                        )}
                        {users.map(u => (
                            <tr key={u._id}>
                                <td>{u.fullName}</td>
                                <td>{u.email}</td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="admin-btn-danger sm" onClick={() => handleDelete(u._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
