import React, { useEffect, useState } from "react";
import { Plus, Tags, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../services/api";

const emptyForm = {
    name: "",
    description: "",
};

const ITEMS_PER_PAGE = 10;

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // State for the separate Alert Modal
    const [alertModal, setAlertModal] = useState({
        show: false,
        type: "success", // 'success' or 'error'
        message: "",
    });

    // Load categories from Laravel API
    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get("/categories");
            const rows = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
            setCategories(rows);
        } catch (err) {
            setAlertModal({
                show: true,
                type: "error",
                message:
                    err.response?.data?.message || "Unable to load categories.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Close form modal on Escape key
    useEffect(() => {
        if (!showForm) return;
        const closeOnEscape = (e) => {
            if (e.key === "Escape" && !saving) setShowForm(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [showForm, saving]);

    // Create category
    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    // Edit category
    const editCategory = (category) => {
        setForm({
            name: category.name || "",
            description: category.description || "",
        });
        setEditingId(category.id);
        setShowForm(true);
    };

    // Save category
    const submitForm = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, form);
            } else {
                await api.post("/categories", form);
            }

            // Close form modal
            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);
            setPage(1);

            // Reload data
            await loadCategories();

            // Show the separate success modal
            setAlertModal({
                show: true,
                type: "success",
                message: editingId
                    ? "Category updated successfully."
                    : "Category created successfully.",
            });
        } catch (err) {
            // If there is an error, we don't close the form, but we show the error modal on top
            const errors = err.response?.data?.errors;
            setAlertModal({
                show: true,
                type: "error",
                message: errors
                    ? Object.values(errors).flat().join(" ")
                    : err.response?.data?.message || "Unable to save category.",
            });
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const deleteCategory = async (id) => {
        if (
            !window.confirm(
                "Delete this category? Products in it will become uncategorized.",
            )
        ) {
            return;
        }

        try {
            await api.delete(`/categories/${id}`);
            await loadCategories();

            setAlertModal({
                show: true,
                type: "success",
                message: "Category deleted successfully.",
            });
        } catch (err) {
            setAlertModal({
                show: true,
                type: "error",
                message:
                    err.response?.data?.message || "Unable to delete category.",
            });
        }
    };

    // Search categories
    const filteredCategories = categories.filter((category) =>
        (category.name || "")
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
    const paginatedCategories = filteredCategories.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
    );

    // Keep current page valid after searching or deleting
    useEffect(() => {
        if (totalPages === 0) {
            if (page !== 1) setPage(1);
        } else if (page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages, page]);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="container-fluid py-3 py-md-4">
            {/* Page heading */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                    <span className="badge bg-primary text-white mb-2">
                        CATALOG
                    </span>
                    <h2 className="fw-bold mb-1">Categories</h2>
                    <p className="text-secondary mb-0">
                        Organize your products into manageable groups.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={openCreate}
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* Summary card */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="bg-info bg-opacity-10 text-primary text-opacity-50 rounded-3 p-3">
                                <Tags size={17} />
                            </div>
                            <div>
                                <p className="text-secondary mb-1">
                                    Total Categories
                                </p>
                                <h3 className="fw-bold mb-0">
                                    {categories.length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                        <div>
                            <h5 className="fw-bold mb-1">All Categories</h5>
                            <small className="text-secondary">
                                {filteredCategories.length} categories found
                            </small>
                        </div>

                        <input
                            type="search"
                            className="form-control"
                            style={{ maxWidth: "320px" }}
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-3 py-3">Category</th>
                                <th>Description</th>
                                <th>Products</th>
                                <th className="text-end px-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-5"
                                    >
                                        <div className="spinner-border text-primary" />
                                        <p className="text-secondary mt-2 mb-0">
                                            Loading categories...
                                        </p>
                                    </td>
                                </tr>
                            ) : paginatedCategories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-5 text-secondary"
                                    >
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedCategories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-info text-primary bg-opacity-10 text-opacity-50 rounded-2 p-2">
                                                    <Tags size={17} />
                                                </div>
                                                <strong>{category.name}</strong>
                                            </div>
                                        </td>
                                        <td className="text-secondary">
                                            {category.description || "—"}
                                        </td>
                                        <td>
                                            <span className="badge bg-primary text-white">
                                                {category.products_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="text-end px-3">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() =>
                                                        editCategory(category)
                                                    }
                                                    title="Edit"
                                                >
                                                    <i className="bi bi-pencil-fill"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        deleteCategory(
                                                            category.id,
                                                        )
                                                    }
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 0 && (
                    <div className="card-footer bg-white border-0 p-3">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                            <small className="text-secondary">
                                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
                                {Math.min(
                                    page * ITEMS_PER_PAGE,
                                    filteredCategories.length,
                                )}{" "}
                                of {filteredCategories.length} categories
                            </small>

                            <nav aria-label="Category pagination">
                                <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center">
                                    <li
                                        className={`page-item ${page === 1 ? "disabled" : ""}`}
                                    >
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() =>
                                                setPage((c) =>
                                                    Math.max(1, c - 1),
                                                )
                                            }
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {getPageNumbers().map((number) => (
                                        <li
                                            key={number}
                                            className={`page-item ${page === number ? "active" : ""}`}
                                        >
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() => setPage(number)}
                                            >
                                                {number}
                                            </button>
                                        </li>
                                    ))}

                                    <li
                                        className={`page-item ${page === totalPages ? "disabled" : ""}`}
                                    >
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() =>
                                                setPage((c) =>
                                                    Math.min(totalPages, c + 1),
                                                )
                                            }
                                            disabled={page === totalPages}
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

            {/* ========================================================
                ADD / EDIT CATEGORY FORM MODAL
            ======================================================== */}
            {showForm && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        overflowY: "auto",
                    }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !saving) {
                            setShowForm(false);
                        }
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header p-3 p-md-4">
                                <div>
                                    <h5 className="modal-title fw-bold">
                                        {editingId
                                            ? "Edit Category"
                                            : "Create Category"}
                                    </h5>
                                    <small className="text-secondary">
                                        {editingId
                                            ? "Update the details for this category."
                                            : "Add a new category to organize your products."}
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
                                <form onSubmit={submitForm}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                Category Name *
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Electronics"
                                                value={form.name}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        name: e.target.value,
                                                    })
                                                }
                                                required
                                                maxLength="255"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">
                                                Description
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Optional description"
                                                value={form.description}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                            />
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
                                                ? "Saving..."
                                                : editingId
                                                  ? "Update Category"
                                                  : "Create Category"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
                SEPARATE SUCCESS/ERROR ALERT MODAL
            ======================================================== */}
            {alertModal.show && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 1060,
                    }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setAlertModal({ ...alertModal, show: false });
                        }
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                            {/* Top Right Close Button */}
                            <button
                                type="button"
                                className="btn-close position-absolute top-0 end-0 m-3"
                                style={{ zIndex: 10 }}
                                onClick={() =>
                                    setAlertModal({
                                        ...alertModal,
                                        show: false,
                                    })
                                }
                                aria-label="Close"
                            />

                            {/* Colored Top Border Strip */}
                            <div
                                style={{
                                    height: "6px",
                                    backgroundColor:
                                        alertModal.type === "success"
                                            ? "#198754"
                                            : "#dc3545",
                                }}
                            />

                            <div className="p-4 pt-5 text-center">
                                <div className="d-flex justify-content-center mb-3">
                                    {alertModal.type === "success" ? (
                                        <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 d-inline-flex">
                                            <CheckCircle2
                                                size={42}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-flex">
                                            <AlertCircle
                                                size={42}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                    )}
                                </div>

                                <h4 className="fw-bold mb-2">
                                    {alertModal.type === "success"
                                        ? "Success"
                                        : "Something went wrong"}
                                </h4>

                                <p className="text-secondary mb-0">
                                    {alertModal.message}
                                </p>
                                <button
                                    className="btn btn-success mt-2 px-3"
                                    aria-label="close"
                                    onClick={() =>
                                        setAlertModal({
                                            ...alertModal,
                                            show: false,
                                        })
                                    }
                                >
                                    Ok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
