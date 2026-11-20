import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    Settings,
    Boxes,
    LogOut, // ✅ Added LogOut
    ChevronLeft,
    Sparkles,
    User as UserIcon, // ✅ Added UserIcon for the profile
} from 'lucide-react';
import api from '../services/api'; // ✅ Ensure you have your api instance

const links = [
    { name: 'Dashboard',  path: '/',           icon: LayoutDashboard },
    { name: 'Products',   path: '/products',   icon: Package },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Users',      path: '/users',      icon: Users },
    { name: 'Settings',   path: '/settings',   icon: Settings },
];

export default function Sidebar({ open, onClose }) {
    const navigate = useNavigate();

    // ✅ Safe parsing to prevent crashes if user isn't logged in
    let user = { name: 'User', email: 'user@example.com' };
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Failed to parse user data");
    }

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear data and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            navigate('/login');
            if (onClose) onClose(); // Close mobile sidebar if open
        }
    };

    return (
        <>
            {/* Mobile backdrop */}
            <div
                className={`sidebar-overlay ${open ? 'show' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <Boxes size={22} />
                        </div>
                        <div className="brand-text">
                            <span className="brand-name">StockFlow</span>
                            <span className="brand-sub">Inventory Manager</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="sidebar-close d-lg-none"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>

                {/* Nav */}
                <div className="sidebar-section-label">Workspace</div>

                <nav className="sidebar-nav">
                    {links.map(({ name, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="sidebar-link-icon">
                                <Icon size={18} />
                            </span>
                            <span className="sidebar-link-text">{name}</span>
                            <span className="sidebar-link-indicator" />
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Logout (Replaced Pro Card) */}
                <div className="sidebar-card" style={{ marginTop: 'auto', background: '#f4f5fa', border: '1px solid #e2e8f0' }}>
                    <div className="sidebar-card-icon" style={{ background: '#635bdb' }}>
                        <UserIcon size={18} color="white" />
                    </div>
                    
                    <div className="sidebar-card-text" style={{ overflow: 'hidden' }}>
                        <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.name}
                        </strong>
                        <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                            {user.email}
                        </span>
                    </div>

                    <button 
                        onClick={handleLogout}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-footer-icon">
                        <Package size={16} />
                    </div>
                    <div className="sidebar-footer-text text-white">
                        <strong>Inventory system</strong>
                        <span>Laravel · React · MySQL</span>
                    </div>
                </div>
            </aside>
        </>
    );
}