import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    Settings,
    Boxes,
    LogOut,
    ChevronLeft,
    User as UserIcon,
} from 'lucide-react';
import api from '../services/api';

const mainLinks = [
    { name: 'Dashboard',  path: '/',           icon: LayoutDashboard },
    { name: 'Products',   path: '/products',   icon: Package },
    { name: 'Categories', path: '/categories', icon: Tags },
];

const systemLinks = [
    { name: 'User Management', path: '/users',    icon: Users },
    { name: 'Settings',        path: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
    let user = { name: 'User', email: 'user@example.com' };
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) user = JSON.parse(storedUser);
    } catch (e) {}

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

    const renderLink = ({ name, path, icon: Icon }) => (
        <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
            <span className="sidebar-link-icon"><Icon size={18} /></span>
            <span className="sidebar-link-text">{name}</span>
        </NavLink>
    );

    return (
        <>
            <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />

            {/* 
              🚀 FIX: Added d-flex flex-column and height: 100vh 
              to make sure the bottom items are pushed to the very bottom.
            */}
            <aside 
                className={`sidebar d-flex flex-column ${open ? 'sidebar-open' : ''}`}
                style={{ height: '100vh', paddingBottom: '20px' }}
            >
                
                {/* BRAND HEADER */}
                <div className="sidebar-header pb-3 border-bottom mb-3 flex-shrink-0">
                    <div className="sidebar-brand d-flex align-items-center gap-3">
                        <div className="brand-icon rounded-3 d-flex align-items-center justify-content-center" style={{ background: '#635bdb', color: 'white', width: '42px', height: '42px' }}>
                            <Boxes size={22} />
                        </div>
                        <div className="brand-text d-flex flex-column">
                            <span className="brand-name fw-bold" style={{ fontSize: '16px', color: '#1e293b' }}>StockFlow</span>
                            <span className="brand-sub text-muted" style={{ fontSize: '12px' }}>Inventory Manager</span>
                        </div>
                    </div>
                    <button type="button" className="sidebar-close d-lg-none border-0 bg-transparent ms-auto" onClick={onClose}>
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* SCROLLABLE NAV SECTION */}
                <div className="flex-grow-1 overflow-auto pe-1">
                    <div className="sidebar-section-label mb-2">Workspace</div>
                    <nav className="sidebar-nav mb-4 d-flex flex-column gap-1">
                        {mainLinks.map(renderLink)}
                    </nav>

                    <div className="sidebar-section-label mb-2">System</div>
                    <nav className="sidebar-nav d-flex flex-column gap-1">
                        {systemLinks.map(renderLink)}
                    </nav>
                </div>

                {/* BOTTOM SECTION: USER PROFILE & FOOTER */}
                <div className="flex-shrink-0 mt-3 pt-3 border-top">
                    
                    {/* User Info */}
                    <div className="d-flex align-items-center gap-3 mb-3 px-1">
                        <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '38px', height: '38px', backgroundColor: '#f4f5fa', color: '#635bdb' }}
                        >
                            <UserIcon size={20} />
                        </div>
                        <div className="overflow-hidden" style={{ flex: 1 }}>
                            <div className="fw-bold text-truncate" style={{ fontSize: '14px', color: '#1e293b' }}>
                                {user.name}
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: '12px' }}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout}
                        className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-medium"
                        style={{ 
                            color: '#dc2626', 
                            backgroundColor: '#fef2f2', 
                            border: '1px solid #fecaca', 
                            padding: '8px 12px',
                            borderRadius: '8px'
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </button>

                    {/* Footer text */}
                    <div className="mt-3 text-center">
                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                            StockFlow v1.0 &middot; Laravel + React
                        </p>
                    </div>
                </div>

            </aside>
        </>
    );
}