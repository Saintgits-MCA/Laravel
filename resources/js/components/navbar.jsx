
import React from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageInfo = {
    '/': {
        title: 'Dashboard',
        subtitle: 'Overview of your inventory and business activity',
    },
    '/products': {
        title: 'Products',
        subtitle: 'Manage your products, stock and pricing',
    },
    '/categories': {
        title: 'Categories',
        subtitle: 'Organize products into manageable groups',
    },
    '/settings': {
        title: 'Settings',
        subtitle: 'Application information and preferences',
    },
};

export default function Navbar({ onMenuClick }) {
    const location = useLocation();

    const currentPage = pageInfo[location.pathname] || {
        title: 'StockFlow',
        subtitle: 'Manage your inventory efficiently',
    };

    return (
        <header className="stockflow-navbar bg-white border-bottom shadow-sm">
            <div className="container-fluid px-3 px-md-4">
                <div className="d-flex align-items-center justify-content-between gap-3 py-3">

                    {/* Left: Menu and page information */}
                    <div className="d-flex align-items-center gap-3 min-w-0">
                        <button
                            type="button"
                            className="btn btn-light border d-lg-none stockflow-menu-btn"
                            onClick={onMenuClick}
                            aria-label="Open navigation menu"
                        >
                            <Menu size={21} />
                        </button>

                        <div className="min-w-0">
                            <h1 className="h4 fw-bold text-dark mb-1">
                                {currentPage.title}
                            </h1>

                            <p className="text-secondary small mb-0 d-none d-sm-block">
                                {currentPage.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Right: Notifications and administrator */}
                    <div className="d-flex align-items-center gap-2 gap-md-3">

                        <button
                            type="button"
                            className="btn btn-light border rounded-circle stockflow-notification-btn position-relative"
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <Bell size={19} />
                            <span className="stockflow-notification-dot" />
                        </button>

                        <div className="vr d-none d-sm-block mx-1" />

                        <div className="d-flex align-items-center gap-2">
                            <div className="stockflow-avatar rounded-circle d-flex align-items-center justify-content-center fw-bold text-white">
                                A
                            </div>

                            <div className="d-none d-sm-block">
                                <div className="fw-semibold text-dark small">
                                    Administrator
                                </div>
                                <div className="text-secondary" style={{ fontSize: '12px' }}>
                                    System Admin
                                </div>
                            </div>

                            <ChevronDown
                                size={16}
                                className="text-secondary d-none d-md-block"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
