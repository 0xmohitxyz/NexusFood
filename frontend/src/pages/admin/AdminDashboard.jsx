import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../../components/admin/UserManagement';
import FoodPartnerManagement from '../../components/admin/FoodPartnerManagement';
import CategoryManagement from '../../components/admin/CategoryManagement';
import FoodManagement from '../../components/admin/FoodManagement';
import '../../styles/admin.css';

const TABS = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'partners', label: 'Food Partners', icon: '🍽️' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'foods', label: 'Create Food', icon: '🎬' },
];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const navigate = useNavigate();

    const handleLogout = async () => {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/logout`, { withCredentials: true });
        navigate('/admin/login');
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>NexusFood</span>
                </div>
                <p className="admin-sidebar-label">ADMIN PANEL</p>

                <nav className="admin-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="admin-nav-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <button className="admin-logout-btn" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Logout
                </button>
            </aside>

            {/* Main */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <h1 className="admin-page-title">{TABS.find(t => t.id === activeTab)?.label}</h1>
                        <p className="admin-page-sub">Manage {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} on the platform</p>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'partners' && <FoodPartnerManagement />}
                    {activeTab === 'categories' && <CategoryManagement />}
                    {activeTab === 'foods' && <FoodManagement />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
