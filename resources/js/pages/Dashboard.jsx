import React, { useEffect, useState } from 'react';
import {
    Package,
    Tags,
    Boxes,
    Wallet,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

import api from '../services/api';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                        <p className="text-secondary mb-2">{title}</p>
                        <h3 className="fw-bold mb-2">{value}</h3>
                        <small className="text-secondary">{subtitle}</small>
                    </div>

                    <div className={`rounded-3 p-3 bg-${color} bg-opacity-10 text-${color}`}>
                        <Icon size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/dashboard');
            setData(response.data);
        } catch {
            setError('Unable to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border text-primary" />
                <p className="text-secondary mt-3">Loading dashboard...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <span>{error || 'Dashboard data is unavailable.'}</span>
                    <button className="btn btn-outline-danger" onClick={loadDashboard}>
                        <RefreshCw size={16} className="me-2" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const chartData = (data.category_stats || []).map(category => ({
        name: category.name,
        products: category.products_count,
    }));

    const recentProducts = data.recent_products || [];

    return (
        <div className="container-fluid py-3 py-md-4">

            {/* Heading */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Welcome back, {data.user_name} !</h2>
                    <p className="text-secondary mb-0">
                        Here's what's happening with your inventory today.
                    </p>
                </div>

                <button
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                    onClick={loadDashboard}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="row g-3 g-lg-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard
                        title="Total Products"
                        value={data.total_products ?? 0}
                        icon={Package}
                        color="primary"
                        subtitle="Products in inventory"
                    />
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard
                        title="Categories"
                        value={data.total_categories ?? 0}
                        icon={Tags}
                        color="info"
                        subtitle="Product categories"
                    />
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard
                        title="Total Stock"
                        value={data.total_stock ?? 0}
                        icon={Boxes}
                        color="success"
                        subtitle="Available units"
                    />
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                    <StatCard
                        title="Stock Value"
                        value={`₹${Number(data.stock_value || 0).toLocaleString('en-IN')}`}
                        icon={Wallet}
                        color="warning"
                        subtitle="Current inventory value"
                    />
                </div>
            </div>

            {/* Chart and inventory alerts */}
            <div className="row g-3 g-lg-4 mb-4">

                <div className="col-12 col-xl-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3 p-md-4">
                            <h5 className="fw-bold mb-1">Products by Category</h5>
                            <p className="text-secondary small mb-4">
                                Distribution of your inventory
                            </p>

                            {chartData.length === 0 ? (
                                <div className="text-center text-secondary py-5">
                                    Add categories and products to see your chart.
                                </div>
                            ) : (
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 45 }} // 👈 Increased bottom margin for rotated text
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11 }} // 👈 Slightly smaller font
                                                interval={0}
                                                angle={-45} // 👈 Rotate text diagonally
                                                textAnchor="end" // 👈 Align text nicely to the tick
                                                height={60} // 👈 Give X-axis enough height for labels
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <Tooltip />
                                            <Bar
                                                dataKey="products"
                                                fill="#635bdb"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={55}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 className="fw-bold mb-1">Inventory Alerts</h5>
                                    <p className="text-secondary small mb-0">
                                        Products needing attention
                                    </p>
                                </div>
                                <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-2">
                                    <AlertTriangle size={23} />
                                </div>
                            </div>

                            <div className="bg-warning bg-opacity-10 rounded-3 p-4 text-center">
                                <h1 className="display-4 fw-bold text-warning mb-1">
                                    {data.low_stock ?? 0}
                                </h1>
                                <p className="fw-semibold mb-0">
                                    Low-stock products
                                </p>
                            </div>

                            <p className="text-secondary small mt-3 mb-0">
                                Products with five or fewer units are considered low stock.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent products */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 p-3 p-md-4">
                    <h5 className="fw-bold mb-1">Recently Added Products</h5>
                    <p className="text-secondary small mb-0">
                        Your latest inventory entries
                    </p>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-3 py-3">Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-secondary">
                                        No products have been added yet.
                                    </td>
                                </tr>
                            ) : (
                                recentProducts.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-3 fw-semibold">
                                            {product.name}
                                        </td>
                                        <td>
                                            {product.category?.name || 'Uncategorized'}
                                        </td>
                                        <td>
                                            ₹{Number(product.price || 0).toFixed(2)}
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark">
                                                {product.quantity}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}