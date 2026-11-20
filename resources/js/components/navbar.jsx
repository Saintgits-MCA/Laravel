import React from 'react';
import { Menu, Bell, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const pageInfo = {
    '/': { title: 'Dashboard', subtitle: 'Overview of your inventory and business activity' },
    '/products': { title: 'Products', subtitle: 'Manage your products, stock and pricing' },
    '/categories': { title: 'Categories', subtitle: 'Organize products into manageable groups' },
    '/users': { title: 'User Management', subtitle: 'Manage system accounts' },
    '/settings': { title: 'Settings', subtitle: 'Application information and preferences' },
};

export default function Navbar({ onMenuClick }) {
    const location = useLocation();
    
    // Safe parsing
    let user = { name: 'Admin', email: 'admin@stockflow.com' };
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) user = JSON.parse(storedUser);
    } catch (e) {}

    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'A';

    const currentPage = pageInfo[location.pathname] || {
        title: 'StockFlow',
        subtitle: 'Manage your inventory efficiently',
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login'; 
        }
    };

    return (
        <>
            {/* Custom CSS for the hover effect */}
            <style>
                {`
                    .logout-btn {
                        background-color: #fef2f2; /* Very light red */
                        color: #dc2626; /* Strong red text */
                        transition: all 0.2s ease-in-out;
                        border: 1px solid transparent;
                    }
                    .logout-btn:hover {
                        background-color: #fee2e2; /* Slightly darker red on hover */
                        color: #b91c1c; /* Darker text */
                        border-color: #fca5a5;
                    }
                    .logout-btn:active {
                        background-color: #fecaca; /* Even darker on click */
                    }
                `}
            </style>

            <header className="stockflow-navbar bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1030 }}>
                <div className="container-fluid px-3 px-md-4">
                    <div className="d-flex align-items-center justify-content-between gap-3 py-2">

                        {/* Left: Menu and page information */}
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <button type="button" className="btn btn-light border d-lg-none stockflow-menu-btn" onClick={onMenuClick}>
                                <Menu size={21} />
                            </button>

                            <div className="min-w-0">
                                <h1 className="h5 fw-bold text-dark mb-0">
                                    {currentPage.title}
                                </h1>
                                <p className="text-secondary small mb-0 d-none d-sm-block" style={{ fontSize: '12px' }}>
                                    {currentPage.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Right: Notifications and Profile Dropdown */}
                        <div className="d-flex align-items-center gap-2 gap-md-3">
                            <button type="button" className="btn btn-light border rounded-circle stockflow-notification-btn position-relative">
                                <Bell size={18} />
                                <span className="stockflow-notification-dot" />
                            </button>

                            <div className="vr d-none d-sm-block mx-1" />

                            {/* User Profile Dropdown (Bootstrap) */}
                            <div className="dropdown">
                                <button
                                    className="btn btn-link text-decoration-none text-dark d-flex align-items-center gap-2 p-0"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ boxShadow: 'none' }}
                                >
                                    <div className="stockflow-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold text-white" style={{ background: '#635bdb', width: '40px', height: '40px' }}>
                                        {initial}
                                    </div>
                                    <div className="d-none d-sm-block text-start me-2">
                                        <div className="fw-semibold text-dark small">{user.name}</div>
                                        <div className="text-secondary" style={{ fontSize: '11px' }}>{user.email}</div>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2" style={{ width: '230px', borderRadius: '12px' }}>
                                    <li className="px-2 py-2 border-bottom mb-2">
                                        <div className="fw-bold text-dark">{user.name}</div>
                                        <div className="text-secondary small text-truncate">{user.email}</div>
                                    </li>
                                    
                                    <li>
                                        <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded" to="/settings">
                                            <UserIcon size={16} /> My Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded" to="/settings">
                                            <Settings size={16} /> Settings
                                        </Link>
                                    </li>
                                    
                                    <li><hr className="dropdown-divider my-2" /></li>
                                    
                                    {/* Improved Logout Button with hover effect */}
                                    <li>
                                        <button 
                                            onClick={handleLogout} 
                                            className="dropdown-item logout-btn d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                                            style={{ borderRadius: '8px' }}
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}