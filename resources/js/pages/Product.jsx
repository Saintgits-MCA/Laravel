
import React, { useEffect, useRef, useState } from 'react';
import {
    Plus,
    Search,
    Package,
    ImagePlus,
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

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const requestIdRef = useRef(0);

    // Load categories
    const loadCategories = async () => {
        const response = await api.get('/categories');

        const rows = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];

        setCategories(rows);
    };

    // Load products
    const loadProducts = async (pageToLoad = page) => {
        const myId = ++requestIdRef.current;

        setLoading(true);

        try {
            const response = await api.get('/products', {
                params: {
                    search,
                    category_id: categoryId,
                    page: pageToLoad,
                    per_page: PER_PAGE,
                },
            });

            if (myId !== requestIdRef.current) return;

            const payload = response.data;
            const rows = Array.isArray(payload)
                ? payload
                : payload?.data || [];

            const serverPage = payload?.current_page ?? pageToLoad;
            const serverLastPage = payload?.last_page ?? 1;

            setProducts(rows);
            setLastPage(serverLastPage);
            setTotal(payload?.total ?? rows.length);

            if (serverPage !== pageToLoad) {
                setPage(serverPage);
            }

            setError('');
        } catch (err) {
            if (myId !== requestIdRef.current) return;

            setError(
                err.response?.data?.message ||
                'Unable to load products. Check that the API is running.'
            );
        } finally {
            if (myId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    // Load categories once
    useEffect(() => {
        loadCategories().catch(() => {
            setError('Unable to load categories.');
        });
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Load products when page or filters change
    useEffect(() => {
        loadProducts(page);

        return () => {
            requestIdRef.current++;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, categoryId]);

    // Close modal with Escape
    useEffect(() => {
        if (!showForm) return;

        const onKey = (event) => {
            if (event.key === 'Escape' && !saving) {
                setShowForm(false);
            }
        };

        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
        };
    }, [showForm, saving]);

    // Form field changes
    const changeField = (event) => {
        const { name, value, files } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: name === 'image'
                ? files?.[0] || null
                : value,
        }));
    };

    // Open create form
    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setMessage('');
        setError('');
        setShowForm(true);
    };

    // Open edit form
    const openEdit = (product) => {
        setForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price ?? '',
            quantity: product.quantity ?? 0,
            category_id: product.category_id || '',
            image: null,
        });

        setEditingId(product.id);
        setMessage('');
        setError('');
        setShowForm(true);
    };

    // Create or update product
    const submitForm = async (event) => {
        event.preventDefault();

        setError('');
        setMessage('');
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
            if (editingId) {
                body.append('_method', 'PUT');

                await api.post(`/products/${editingId}`, body);

                setMessage('Product updated successfully.');
            } else {
                await api.post('/products', body);

                setMessage('Product added successfully.');
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);

            await loadProducts(page);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            setError(
                validationErrors
                    ? Object.values(validationErrors).flat().join(' ')
                    : err.response?.data?.message ||
                      'Unable to save product.'
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete product
    const deleteProduct = async (id) => {
        if (!window.confirm(
            'Delete this product? This action cannot be undone.'
        )) {
            return;
        }

        setError('');
        setMessage('');

        try {
            await api.delete(`/products/${id}`);

            setMessage('Product deleted successfully.');

            // Reload current page to check whether it still has products
            const response = await api.get('/products', {
                params: {
                    search,
                    category_id: categoryId,
                    page,
                    per_page: PER_PAGE,
                },
            });

            const payload = response.data;
            const rows = Array.isArray(payload)
                ? payload
                : payload?.data || [];

            if (rows.length === 0 && page > 1) {
                setPage(current => current - 1);
            } else {
                setProducts(rows);
                setLastPage(payload?.last_page ?? 1);
                setTotal(payload?.total ?? rows.length);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete product.'
            );
        }
    };

    // Go to selected page
    const goToPage = (nextPage) => {
        const newPage = Math.max(
            1,
            Math.min(nextPage, lastPage)
        );

        if (newPage !== page) {
            setPage(newPage);
        }
    };

    // Generate page numbers
    const getPageNumbers = () => {
        return Array.from(
            { length: lastPage },
            (_, index) => index + 1
        );
    };

    return (
        <div className="container-fluid py-3 py-md-4">

            {/* Page heading */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">

                <div>
                    <span className="badge bg-primary text-white mb-2">
                        INVENTORY
                    </span>

                    <h2 className="fw-bold mb-1">Products</h2>

                    <p className="text-secondary mb-0">
                        Manage your catalogue, pricing and stock levels.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={openCreate}
                >
                    <Plus size={18} />
                    Add Product
                </button>

            </div>

            {/* Messages */}
            {message && (
                <div className="alert alert-success alert-dismissible fade show">
                    {message}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage('')}
                    />
                </div>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError('')}
                    />
                </div>
            )}

            {/* Product list */}
            <div className="card border-0 shadow-sm">

                {/* Header and filters */}
                <div className="card-header bg-white border-0 p-3 p-md-4">

                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

                        <div>
                            <h5 className="fw-bold mb-1">
                                All Products
                            </h5>

                            <p className="text-secondary small mb-0">
                                {total} product{total === 1 ? '' : 's'} found
                            </p>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2">

                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <Search size={17} />
                                </span>

                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Search products..."
                                    value={searchInput}
                                    onChange={event => setSearchInput(event.target.value)}
                                />
                            </div>

                            <select
                                className="form-select"
                                value={categoryId}
                                onChange={event => {
                                    setPage(1);
                                    setCategoryId(event.target.value);
                                }}
                            >
                                <option value="">All Categories</option>

                                {categories.map(category => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
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
                                <tr>
                                    <td colSpan="5" className="text-center py-5">

                                        <div className="spinner-border text-primary" />

                                        <p className="text-secondary mt-2 mb-0">
                                            Loading products...
                                        </p>

                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">

                                        <Package
                                            size={35}
                                            className="text-secondary mb-2"
                                        />

                                        <p className="text-secondary mb-0">
                                            No products found.
                                        </p>

                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id}>

                                        <td className="px-3">
                                            <div className="d-flex align-items-center gap-3">

                                                {product.image ? (
                                                    <img
                                                        src={
                                                            product.image_url ||
                                                            `/storage/${product.image}`
                                                        }
                                                        alt={product.name}
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            objectFit: 'cover',
                                                            borderRadius: '10px',
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="bg-light rounded-3 p-3">
                                                        <Package
                                                            size={20}
                                                            className="text-secondary"
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="fw-semibold">
                                                        {product.name}
                                                    </div>

                                                    <small className="text-secondary">
                                                        {product.description || 'No description'}
                                                    </small>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            {product.category?.name ||
                                                categories.find(category =>
                                                    String(category.id) ===
                                                    String(product.category_id)
                                                )?.name ||
                                                'Uncategorized'}
                                        </td>

                                        <td className="fw-semibold">
                                            ₹{Number(product.price || 0).toFixed(2)}
                                        </td>

                                        <td>
                                            <span className={`badge ${
                                                Number(product.quantity) === 0
                                                    ? 'bg-danger'
                                                    : Number(product.quantity) <= 5
                                                        ? 'bg-warning text-dark'
                                                        : 'bg-success'
                                            }`}>
                                                {product.quantity} units
                                            </span>
                                        </td>

                                        <td className="text-end px-3">
                                            <div className="d-flex justify-content-end gap-2">

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Edit product"
                                                    onClick={() => openEdit(product)}
                                                >
                                                    <i class="bi bi-pencil-fill"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete product"
                                                    onClick={() => deleteProduct(product.id)}
                                                >
                                                    <i class="bi bi-trash-fill" size={15}></i>
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>

                {/* Numbered pagination */}
                {!loading && lastPage > 0 && (
                    <div className="card-footer bg-white border-0 p-3">

                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">

                            <small className="text-secondary">
                                Showing{' '}
                                {total > 0 ? (page - 1) * PER_PAGE + 1 : 0}
                                {' '}to{' '}
                                {Math.min(page * PER_PAGE, total)}
                                {' '}of {total} products
                            </small>

                            <nav aria-label="Product pagination">

                                <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center">

                                    {/* Previous */}
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            type="button"
                                            className="page-link"
                                            disabled={page === 1 || loading}
                                            onClick={() => goToPage(page - 1)}
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {/* Page numbers */}
                                    {getPageNumbers().map(number => (
                                        <li
                                            key={number}
                                            className={`page-item ${page === number ? 'active' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                className="page-link"
                                                disabled={loading}
                                                onClick={() => goToPage(number)}
                                            >
                                                {number}
                                            </button>
                                        </li>
                                    ))}

                                    {/* Next */}
                                    <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}>
                                        <button
                                            type="button"
                                            className="page-link"
                                            disabled={page === lastPage || loading}
                                            onClick={() => goToPage(page + 1)}
                                        >
                                            Next
                                        </button>
                                    </li>

                                </ul>

                            </nav>

                        </div>
                    </div>
                )}

            </div>

            {/* Add / Edit Product Modal */}
            {showForm && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        overflowY: 'auto',
                    }}
                    onMouseDown={event => {
                        if (
                            event.target === event.currentTarget &&
                            !saving
                        ) {
                            setShowForm(false);
                        }
                    }}
                >

                    <div className="modal-dialog modal-dialog-centered modal-lg">

                        <div className="modal-content border-0 shadow rounded-4">

                            <div className="modal-header p-3 p-md-4">

                                <div>
                                    <h5 className="modal-title fw-bold">
                                        {editingId ? 'Edit Product' : 'Add New Product'}
                                    </h5>

                                    <small className="text-secondary">
                                        Enter your product information below.
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowForm(false)}
                                    disabled={saving}
                                />

                            </div>

                            <div className="modal-body p-3 p-md-4">

                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={submitForm}>

                                    <div className="row g-3">

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                Product Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={form.name}
                                                onChange={changeField}
                                                placeholder="Enter product name"
                                                required
                                                maxLength="255"
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                Description
                                            </label>

                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows="3"
                                                value={form.description}
                                                onChange={changeField}
                                                placeholder="Enter product description"
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold">
                                                Price (₹) *
                                            </label>

                                            <input
                                                type="number"
                                                name="price"
                                                className="form-control"
                                                value={form.price}
                                                onChange={changeField}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-semibold">
                                                Quantity *
                                            </label>

                                            <input
                                                type="number"
                                                name="quantity"
                                                className="form-control"
                                                value={form.quantity}
                                                onChange={changeField}
                                                min="0"
                                                step="1"
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                Category
                                            </label>

                                            <select
                                                name="category_id"
                                                className="form-select"
                                                value={form.category_id}
                                                onChange={changeField}
                                            >
                                                <option value="">
                                                    No category
                                                </option>

                                                {categories.map(category => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                Product Image
                                            </label>

                                            <label
                                                htmlFor="product-image"
                                                className="border rounded-3 p-3 d-flex align-items-center gap-3 w-100"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                                                    <ImagePlus size={23} />
                                                </div>

                                                <div className="overflow-hidden">
                                                    <div className="fw-semibold">
                                                        {form.image
                                                            ? form.image.name
                                                            : 'Choose an image'}
                                                    </div>

                                                    <small className="text-secondary">
                                                        PNG, JPG or WEBP
                                                    </small>
                                                </div>
                                            </label>

                                            <input
                                                id="product-image"
                                                type="file"
                                                name="image"
                                                className="form-control d-none"
                                                accept="image/png,image/jpeg,image/webp"
                                                onChange={changeField}
                                            />

                                            {editingId && (
                                                <small className="text-secondary d-block mt-2">
                                                    Leave empty to keep the current image.
                                                </small>
                                            )}
                                        </div>

                                    </div>

                                    <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">

                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() => setShowForm(false)}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving
                                                ? 'Saving...'
                                                : editingId
                                                    ? 'Update Product'
                                                    : 'Add Product'}
                                        </button>

                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
