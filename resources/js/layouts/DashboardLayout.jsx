
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-area">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="page-content">
                    <Outlet />
                </main>

                <footer className="app-footer">
                    Inventory Management System · Built with Laravel + React
                </footer>
            </div>
        </div>
    );
}
