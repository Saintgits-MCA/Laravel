import React, { useEffect, useRef, useState } from 'react';
import {
    Plus,
    Search,
    Package,
    ImagePlus,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

import api from '../services/api';

const emptyForm = {
    name: '',
    description: '',
    price: '',
    quantity: 0,
    category_id: '',
    image: null,
};

const PER_PAGE = 10;

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);
    
    // We need to store the existing image URL to show in the edit modal
    const [currentImage, setCurrentImage] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [alertModal, setAlertModal] = useState({
        show: false,
        type: 'success',
        message: '',
    });

    const requestIdRef = useRef(0);

    const loadCategories = async () => {
        try {
            const response = await api.get('/categories');
            const rows = Array.isArray(response.data) ? response.data : response.data?.data || [];
            setCategories(rows);
        } catch (err) {
            setAlertModal({ show: true, type: 'error', message: 'Unable to load categories.' });
        }
    };

    const loadProducts = async (pageToLoad = page) => {
        const myId = ++requestIdRef.current;
        setLoading(true);

        try {
            const response = await api.get('/products', {
                params: { search, category_id: categoryId, page: pageToLoad, per_page: PER_PAGE },
            });

            if (myId !== requestIdRef.current) return;

            const payload = response.data;
            const rows = Array.isArray(payload) ? payload : payload?.data || [];

            setProducts(rows);
            setLastPage(payload?.last_page ?? 1);
            setTotal(payload?.total ?? rows.length);

            if (payload?.current_page && payload.current_page !== pageToLoad) {
                setPage(payload.current_page);
            }
        } catch (err) {
            if (myId !== requestIdRef.current) return;
            setAlertModal({
                show: true,
                type: 'error',
                message: err.response?.data?.message || 'Unable to load products.',
            });
        } finally {
            if (myId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => { loadCategories(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadProducts(page);
        return () => { requestIdRef.current++; };
    }, [page, search, categoryId]);

    useEffect(() => {
        if (!showForm) return;
        const onKey = (event) => {
            if (event.key === 'Escape' && !saving) setShowForm(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showForm, saving]);

    const changeField = (event) => {
        const { name, value, files } = event.target;
        setForm(previous => ({
            ...previous,
            [name]: name === 'image' ? files?.[0] || null : value,
        }));
    };

    const openCreate = () => {
        setForm(emptyForm);
        setCurrentImage(null); // Reset image
        setEditingId(null);
        setShowForm(true);
    };

    const openEdit = (product) => {
        setForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price ?? '',
            quantity: product.quantity ?? 0,
            category_id: product.category_id || '',
            image: null,
        });
        
        // Save the existing image URL
        setCurrentImage(product.image_url || (product.image ? `/storage/${product.image}` : null));
        
        setEditingId(product.id);
        setShowForm(true);
    };

    const submitForm = async (event) => {
        event.preventDefault();
        setSaving(true);

        const body = new FormData();
        body.append('name', form.name.trim());
        body.append('description', form.description || '');
        body.append('price', form.price);
        body.append('quantity', form.quantity);
        body.append('category_id', form.category_id || '');

        if (form.image) {
            body.append('image', form.image);
        }

        try {
            let successMsg = '';
            if (editingId) {
                body.append('_method', 'PUT');
                await api.post(`/products/${editingId}`, body);
                successMsg = 'Product updated successfully.';
            } else {
                await api.post('/products', body);
                successMsg = 'Product added successfully.';
            }

            setShowForm(false);
            setForm(emptyForm);
            setCurrentImage(null);
            setEditingId(null);

            await loadProducts(page);
            setAlertModal({ show: true, type: 'success', message: successMsg });

        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            setAlertModal({
                show: true,
                type: 'error',
                message: validationErrors ? Object.values(validationErrors).flat().join(' ') : err.response?.data?.message || 'Unable to save product.',
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product? This action cannot be undone.')) return;

        try {
            await api.delete(`/products/${id}`);
            if (products.length === 1 && page > 1) {
                setPage(current => current - 1);
            } else {
                await loadProducts(page);
            }
            setAlertModal({ show: true, type: 'success', message: 'Product deleted successfully.' });
        } catch (err) {
            setAlertModal({ show: true, type: 'error', message: err.response?.data?.message || 'Unable to delete product.' });
        }
    };

    const goToPage = (nextPage) => {
        const newPage = Math.max(1, Math.min(nextPage, lastPage));
        if (newPage !== page) setPage(newPage);
    };

    const getPageNumbers = () => Array.from({ length: lastPage }, (_, index) => index + 1);

    return (
        <div className="container-fluid py-3 py-md-4">
            {/* Page heading */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                    <span className="badge bg-primary text-white mb-2">INVENTORY</span>
                    <h2 className="fw-bold mb-1">Products</h2>
                    <p className="text-secondary mb-0">Manage your catalogue, pricing and stock levels.</p>
                </div>
                <button type="button" className="btn btn-primary d-flex align-items-center justify-content-center gap-2" onClick={openCreate}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Product list */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                            <h5 className="fw-bold mb-1">All Products</h5>
                            <p className="text-secondary small mb-0">{total} products found</p>
                        </div>
                        <div className="d-flex flex-column flex-sm-row gap-2">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><Search size={17} /></span>
                                <input type="search" className="form-control" placeholder="Search products..." value={searchInput} onChange={event => setSearchInput(event.target.value)} />
                            </div>
                            <select className="form-select" value={categoryId} onChange={event => { setPage(1); setCategoryId(event.target.value); }}>
                                <option value="">All Categories</option>
                                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products table */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-3 py-3">Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th className="text-end px-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary" /><p className="text-secondary mt-2 mb-0">Loading products...</p></td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5"><Package size={35} className="text-secondary mb-2" /><p className="text-secondary mb-0">No products found.</p></td></tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id}>
                                        <td className="px-3">
                                            <div className="d-flex align-items-center gap-3">
                                                {product.image ? (
                                                    <img src={product.image_url || `/storage/${product.image}`} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px' }} />
                                                ) : (
                                                    <div className="bg-light rounded-3 p-3"><Package size={20} className="text-secondary" /></div>
                                                )}
                                                <div>
                                                    <div className="fw-semibold">{product.name}</div>
                                                    <small className="text-secondary">{product.description || 'No description'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.category?.name || categories.find(c => String(c.id) === String(product.category_id))?.name || 'Uncategorized'}</td>
                                        <td className="fw-semibold">₹{Number(product.price || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${Number(product.quantity) === 0 ? 'bg-danger' : Number(product.quantity) <= 5 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                                {product.quantity} units
                                            </span>
                                        </td>
                                        <td className="text-end px-3">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEdit(product)}><i className="bi bi-pencil-fill"></i></button>
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(product.id)}><i className="bi bi-trash-fill" style={{ fontSize: '15px' }}></i></button>
                                            </div>
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
                            <small className="text-secondary">Showing {total > 0 ? (page - 1) * PER_PAGE + 1 : 0} to {Math.min(page * PER_PAGE, total)} of {total} products</small>
                            <nav aria-label="Product pagination">
                                <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={page === 1 || loading} onClick={() => goToPage(page - 1)}>Previous</button></li>
                                    {getPageNumbers().map(number => (
                                        <li key={number} className={`page-item ${page === number ? 'active' : ''}`}><button type="button" className="page-link" disabled={loading} onClick={() => goToPage(number)}>{number}</button></li>
                                    ))}
                                    <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}><button type="button" className="page-link" disabled={page === lastPage || loading} onClick={() => goToPage(page + 1)}>Next</button></li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} onMouseDown={event => { if (event.target === event.currentTarget && !saving) setShowForm(false); }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header p-3 p-md-4">
                                <div>
                                    <h5 className="modal-title fw-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h5>
                                    <small className="text-secondary">Enter your product information below.</small>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setShowForm(false)} disabled={saving} />
                            </div>

                            <div className="modal-body p-3 p-md-4">
                                <form onSubmit={submitForm}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Product Name *</label>
                                            <input type="text" name="name" className="form-control" value={form.name} onChange={changeField} required maxLength="255" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Description</label>
                                            <textarea name="description" className="form-control" rows="3" value={form.description} onChange={changeField} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold">Price (₹) *</label>
                                            <input type="number" name="price" onWheel={(e) => e.target.blur()} className="form-control" value={form.price} onChange={changeField} min="0" step="0.01" required />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold">Quantity *</label>
                                            <input type="number" name="quantity" onWheel={(e) => e.target.blur()} className="form-control" value={form.quantity} onChange={changeField} min="0" step="1" required />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Category</label>
                                            <select name="category_id" className="form-select" value={form.category_id} onChange={changeField}>
                                                <option value="">No category</option>
                                                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                                            </select>
                                        </div>
                                        
                                        {/* ========================================================
                                            UPDATED IMAGE UPLOAD SECTION
                                        ======================================================== */}
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Product Image</label>
                                            <label htmlFor="product-image" className="border rounded-3 p-3 d-flex align-items-center gap-3 w-100" style={{ cursor: 'pointer' }}>
                                                
                                                {/* Image Preview Logic */}
                                                {form.image ? (
                                                    // If user selected a NEW image, show a temporary preview using FileReader URL
                                                    <img 
                                                        src={URL.createObjectURL(form.image)} 
                                                        alt="Preview" 
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                                                    />
                                                ) : currentImage ? (
                                                    // If editing and no new image selected, show existing image from DB
                                                    <img 
                                                        src={currentImage} 
                                                        alt="Current" 
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                                                    />
                                                ) : (
                                                    // Default state (no image)
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                                                        <ImagePlus size={23} />
                                                    </div>
                                                )}

                                                <div className="overflow-hidden">
                                                    <div className="fw-semibold">
                                                        {form.image ? form.image.name : (editingId && currentImage ? 'Change image' : 'Choose an image')}
                                                    </div>
                                                    <small className="text-secondary">PNG, JPG or WEBP</small>
                                                </div>
                                            </label>
                                            
                                            <input id="product-image" type="file" name="image" className="form-control d-none" accept="image/png,image/jpeg,image/webp" onChange={changeField} />
                                            
                                            {editingId && (
                                                <small className="text-secondary d-block mt-2">Leave empty to keep the current image.</small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">
                                        <button type="button" className="btn btn-light" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            {alertModal.show && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setAlertModal({ ...alertModal, show: false }); }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                            <button type="button" className="btn-close position-absolute top-0 end-0 m-3" style={{ zIndex: 10 }} onClick={() => setAlertModal({ ...alertModal, show: false })} />
                            <div style={{ height: '6px', backgroundColor: alertModal.type === 'success' ? '#198754' : '#dc3545' }} />
                            <div className="p-4 pt-5 text-center">
                                <div className="d-flex justify-content-center mb-3">
                                    {alertModal.type === 'success' ? <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 d-inline-flex"><CheckCircle2 size={42} strokeWidth={2.5} /></div> : <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-flex"><AlertCircle size={42} strokeWidth={2.5} /></div>}
                                </div>
                                <h4 className="fw-bold mb-2">{alertModal.type === 'success' ? 'Success' : 'Something went wrong'}</h4>
                                <p className="text-secondary mb-0">{alertModal.message}</p>
                                <button className="btn btn-success mt-2 px-3" aria-label="close" onClick={() => setAlertModal({ ...alertModal, show: false })}>Ok</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}