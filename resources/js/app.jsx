import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Product';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // If data is less than 5 minutes old, don't re-fetch when navigating back to the page
            staleTime: 1000 * 60 * 5, 
            // Don't re-fetch just because the user clicked away to another browser tab and came back
            refetchOnWindowFocus: false,
            // Keep showing the old data while fetching new pages (prevents the full page spinner)
            placeholderData: (previousData) => previousData,
            retry: 1, // Only retry failed requests once
        },
    },
});

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/settings" element={<Settings />} />
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