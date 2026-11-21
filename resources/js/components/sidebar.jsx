
import React, { useState } from 'react';
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
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import api from '../services/api';

const mainLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Categories', path: '/categories', icon: Tags },
];

const systemLinks = [
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
    const [collapsed, setCollapsed] = useState(false);

    let user = { name: 'User', email: 'user@example.com' };

    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) user = JSON.parse(storedUser);
    } catch (e) {
        console.error('Unable to read user:', e);
    }

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
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
            title={collapsed ? name : undefined}
            className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
            }
        >
            <span className="sidebar-link-icon">
                <Icon size={19} />
            </span>

            <span className="sidebar-link-text">
                {name}
            </span>
        </NavLink>
    );

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${open ? 'show' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`sidebar d-flex flex-column
                    ${open ? 'sidebar-open' : ''}
                    ${collapsed ? 'sidebar-collapsed' : ''}`}
            >
                {/* HEADER */}
                <div className="sidebar-header flex-shrink-0">

                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <Boxes size={22} />
                        </div>

                        <div className="brand-text">
                            <span className="brand-name">StockFlow</span>
                            <span className="brand-sub">
                                Inventory Manager
                            </span>
                        </div>
                    </div>

                    {/* Desktop collapse button */}
                    <button
                        type="button"
                        className="sidebar-toggle d-none ms-3 d-lg-flex"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed
                            ? <PanelLeftOpen size={19} />
                            : <PanelLeftClose size={19} />
                        }
                    </button>

                    {/* Mobile close button */}
                    <button
                        type="button"
                        className="sidebar-close d-lg-none"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* NAVIGATION */}
                <div className="sidebar-navigation flex-grow-1">

                    <div className="sidebar-section-label">
                        Workspace
                    </div>

                    <nav className="sidebar-nav mb-4">
                        {mainLinks.map(renderLink)}
                    </nav>

                    <div className="sidebar-section-label">
                        System
                    </div>

                    <nav className="sidebar-nav">
                        {systemLinks.map(renderLink)}
                    </nav>

                </div>

                {/* USER PROFILE AND FOOTER */}
                <div className="sidebar-bottom flex-shrink-0">

                    <div className="sidebar-user">
                        <div className="sidebar-user-icon">
                            <UserIcon size={20} />
                        </div>

                        <div className="sidebar-user-details">
                            <div className="sidebar-user-name">
                                {user.name}
                            </div>

                            <div className="sidebar-user-email">
                                {user.email}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="sidebar-logout"
                        title={collapsed ? 'Logout' : undefined}
                    >
                        <LogOut size={17} />
                        <span>Logout</span>
                    </button>

                    <div className="sidebar-footer-text">
                        StockFlow v1.0 · Laravel + React
                    </div>

                </div>
            </aside>
        </>
    );
}
