import React, { useEffect, useState } from 'react';
import { Plus, User as UserIcon, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'; // Added Check/Alert icons
import api from '../services/api';

const emptyForm = { name: '', email: '', password: '' };

export default function Users() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    
    // Alert Modal State
    const [alertModal, setAlertModal] = useState({ show: false, type: 'success', message: '' });

    const loadUsers = async (pageToLoad = page) => {
        try {
            setLoading(true);
            const res = await api.get(`/users?page=${pageToLoad}`);
            setUsers(res.data.data || []);
            setLastPage(res.data.last_page || 1);
            setTotal(res.data.total || 0);
            setPage(res.data.current_page || 1);
        } catch (err) {
            setAlertModal({ show: true, type: 'error', message: 'Unable to load users.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(page);
    }, [page]);

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowPassword(false);
        setShowForm(true);
    };

    const openEdit = (user) => {
        setForm({ name: user.name, email: user.email, password: user.password || '' });
        setEditingId(user.id);
        setShowPassword(false);
        setShowForm(true);
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/users/${editingId}`, form);
                setAlertModal({ show: true, type: 'success', message: 'User updated successfully.' });
            } else {
                await api.post('/users', form);
                setAlertModal({ show: true, type: 'success', message: 'User created successfully.' });
            }
            setShowForm(false);
            
            if (!editingId && page !== 1) {
                setPage(1);
            } else {
                loadUsers(page);
            }
            
        } catch (err) {
            setAlertModal({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Validation failed. Check email or password length.'
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        
        try {
            await api.delete(`/users/${id}`);
            if (users.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                loadUsers(page);
            }
            setAlertModal({ show: true, type: 'success', message: 'User deleted successfully.' });
        } catch (err) {
            setAlertModal({ show: true, type: 'error', message: err.response?.data?.message || 'Cannot delete user.' });
        }
    };

    const getPageNumbers = () => {
        return Array.from({ length: lastPage }, (_, i) => i + 1);
    };

    return (
        <div className="container-fluid py-3 py-md-4">
            {/* Page Heading */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                    <span className="badge bg-primary text-white mb-2">SYSTEM</span>
                    <h2 className="fw-bold mb-1">User Management</h2>
                    <p className="text-secondary mb-0">Manage system accounts.</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreate}>
                    <Plus size={18} /> Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th>Joined Date</th>
                                <th className="text-end px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5">
                                        <div className="spinner-border text-primary" />
                                        <p className="text-secondary mt-2 mb-0">Loading users...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-secondary">No users found.</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">{user.name}</div>
                                                    <small className="text-secondary">{user.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-secondary">
                                            {new Date(user.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="text-end px-4">
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(user)}>
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(user.id)}>
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {!loading && lastPage > 0 && (
                    <div className="card-footer bg-white border-0 p-3">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                            <small className="text-secondary">
                                Total {total} users
                            </small>
                            <nav aria-label="User pagination">
                                <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button type="button" className="page-link" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>
                                            Previous
                                        </button>
                                    </li>
                                    {getPageNumbers().map(number => (
                                        <li key={number} className={`page-item ${page === number ? 'active' : ''}`}>
                                            <button type="button" className="page-link" disabled={loading} onClick={() => setPage(number)}>
                                                {number}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}>
                                        <button type="button" className="page-link" disabled={page === lastPage || loading} onClick={() => setPage(page + 1)}>
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit User Form Modal */}
            {showForm && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header p-4 border-0 pb-0">
                                <h5 className="modal-title fw-bold">{editingId ? 'Edit User' : 'Add New User'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={submitForm}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    
                                    {/* Password Field with Eye Toggle */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            Password {editingId ? '' : '*'}
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="form-control pe-5"
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                required={!editingId}
                                                minLength="4"
                                                placeholder={editingId ? '••••••••' : ''}
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

                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>
                                            {saving ? 'Saving...' : 'Save User'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                IMPROVED SUCCESS / ERROR ALERT MODAL
            ========================================================= */}
            {alertModal.show && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                            
                            {/* Close Icon (Top Right) */}
                            <button
                                type="button"
                                className="btn-close position-absolute top-0 end-0 m-3 shadow-none"
                                onClick={() => setAlertModal({ ...alertModal, show: false })}
                                style={{ zIndex: 10 }}
                            />

                            <div className="p-4 pt-5 text-center">
                                {/* Icon */}
                                <div className="d-flex justify-content-center mb-3">
                                    {alertModal.type === 'success' ? (
                                        <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 d-inline-flex">
                                            <CheckCircle2 size={42} strokeWidth={2.5} />
                                        </div>
                                    ) : (
                                        <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-flex">
                                            <AlertCircle size={42} strokeWidth={2.5} />
                                        </div>
                                    )}
                                </div>

                                {/* Title & Message */}
                                <h4 className="fw-bold mb-2">
                                    {alertModal.type === 'success' ? 'Success!' : 'Something went wrong'}
                                </h4>
                                <p className="text-secondary mb-4 px-2">
                                    {alertModal.message}
                                </p>

                                {/* Action Button */}
                                <button
                                    type="button"
                                    className={`btn btn-${alertModal.type === 'success' ? 'success' : 'danger'} w-100 py-2 fw-semibold rounded-3`}
                                    onClick={() => setAlertModal({ ...alertModal, show: false })}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}