import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Eye, EyeOff, ShieldCheck, TrendingUp, Package } from 'lucide-react';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            // 🚨 PRINT THE EXACT LARAVEL RESPONSE TO CONSOLE
            console.log("Full Laravel Error Response:", err.response); 
            
            // Show the error in the red box
            const message = 
                err.response?.data?.errors?.email?.[0] || 
                err.response?.data?.message || 
                'Login failed. Open F12 console for details.';
            
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex bg-white">
            
            {/* Left Side - Branding (Hidden on mobile) */}
            <div 
                className="d-none d-lg-flex flex-column justify-content-between p-5 text-white w-50"
                style={{ 
                    background: 'linear-gradient(135deg, #635bdb 0%, #8b83f0 100%)',
                }}
            >
                <div>
                    {/* Logo */}
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="bg-white bg-opacity-25 rounded-3 p-2 d-flex align-items-center justify-content-center">
                            <Boxes size={24} color="white" />
                        </div>
                        <h4 className="fw-bold mb-0 text-white">StockFlow</h4>
                    </div>

                    {/* Marketing Text - Made smaller to fit screen */}
                    <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>
                        Manage your inventory with clarity.
                    </h1>
                    <p className="text-white text-opacity-75 mb-4" style={{ fontSize: '1rem' }}>
                        The complete inventory management system built for modern businesses. Track products, manage stock, and generate insights instantly.
                    </p>

                    {/* Feature List */}
                    <div className="d-flex flex-column gap-3 mt-4">
                        <div className="d-flex align-items-center gap-3">
                            <ShieldCheck size={20} />
                            <span>Secure role-based access control</span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <TrendingUp size={20} />
                            <span>Real-time stock tracking & insights</span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <Package size={20} />
                            <span>Seamless product categorization</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-white text-opacity-50 small">
                    © {new Date().getFullYear()} StockFlow. Laravel + React.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="d-flex align-items-center justify-content-center w-100 w-lg-50 p-4">
                <div className="w-100" style={{ maxWidth: '380px' }}>
                    
                    {/* Mobile Logo */}
                    <div className="d-lg-none text-center mb-4">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px' }}>
                            <Boxes size={30} />
                        </div>
                        <h3 className="fw-bold">StockFlow</h3>
                    </div>

                    <div className="mb-4">
                        <h2 className="fw-bold mb-1 text-dark">Welcome back</h2>
                        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Please enter your details to sign in.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger border-0 py-2 text-center small shadow-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>Email Address</label>
                            <input
                                type="email"
                                className="form-control bg-light"
                                style={{ padding: '0.75rem 1rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@stockflow.com"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <label className="form-label fw-semibold text-dark mb-0" style={{ fontSize: '0.85rem' }}>Password</label>
                                <a href="#" className="text-primary small text-decoration-none">Forgot password?</a>
                            </div>
                            <div className="position-relative mt-2">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control bg-light pe-5"
                                    style={{ padding: '0.75rem 1rem' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-link text-secondary position-absolute top-50 end-0 translate-middle-y text-decoration-none px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-check mb-4">
                            <input className="form-check-input" type="checkbox" id="remember" />
                            <label className="form-check-label text-secondary small" htmlFor="remember">
                                Remember for 30 days
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 fw-semibold shadow-sm" 
                            style={{ padding: '0.75rem', backgroundColor: '#635bdb', borderColor: '#635bdb' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-secondary small mb-0">
                            Don't have an account? <span className="text-primary fw-semibold" style={{ cursor: 'pointer' }}>Contact Admin</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}