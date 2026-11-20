import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Added Navigate and Outlet

import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Product';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Users from './pages/users';
import Login from './pages/Login';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, 
            refetchOnWindowFocus: false,
            placeholderData: (previousData) => previousData,
            retry: 1, 
        },
    },
});

// ==========================================
// PROTECTED ROUTE COMPONENT
// ==========================================
const ProtectedRoute = () => {
    // Check if the user has a token
    const token = localStorage.getItem('auth_token');

    if (!token) {
        // If not, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // If they do have a token, render the children routes (Outlet)
    return <Outlet />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    {/* DashboardLayout will now wrap all protected pages, including the root "/" */}
                    <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="users" element={<Users />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);