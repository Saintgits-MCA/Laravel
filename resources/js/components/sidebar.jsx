import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    Settings,
    Boxes,
    ChevronLeft,
    Sparkles,
} from 'lucide-react';

const links = [
    { name: 'Dashboard',  path: '/',           icon: LayoutDashboard },
    { name: 'Products',   path: '/products',   icon: Package },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Settings',   path: '/settings',   icon: Settings },
];

export default function Sidebar({ open, onClose }) {
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

                {/* Upgrade / info card */}
                <div className="sidebar-card">
                    <div className="sidebar-card-icon">
                        <Sparkles size={18} />
                    </div>
                    <div className="sidebar-card-text">
                        <strong>StockFlow Pro</strong>
                        <span>Unlock advanced analytics</span>
                    </div>
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