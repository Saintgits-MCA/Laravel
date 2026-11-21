import React, { useEffect, useRef, useState } from "react";
import { Plus, Tags, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../services/api";

const emptyForm = {
    name: "",
    description: "",
};

const PER_PAGE = 5;

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Search (debounced) + server-side pagination
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0); // matches for current search
    const [totalAll, setTotalAll] = useState(0); // all categories, ignoring search
    const [responseFrom, setResponseFrom] = useState(null);
    const [responseTo, setResponseTo] = useState(null);
    const [alertModal, setAlertModal] = useState({
        show: false,
        type: "success",
        message: "",
    });

    const requestIdRef = useRef(0);

    // Load ONE page of categories from the server
    const loadCategories = async (pageToLoad = page) => {
        
        const myId = ++requestIdRef.current;
        setLoading(true);

        try {
            const response = await api.get("/categories", {
                params: { page: pageToLoad, per_page: PER_PAGE, search },
            });


            if (myId !== requestIdRef.current) return;

            const payload = response.data;
            const rows = Array.isArray(payload) ? payload : payload?.data || [];
            const last = payload?.last_page ?? 1;
            console.log("Pagination response:", payload);
console.log("Current page:", payload.current_page);
console.log("Per page:", payload.per_page);
console.log("Total:", payload.total);
console.log("Last page:", payload.last_page);

            // Requested page no longer exists (e.g. last item deleted) -> go back
            if (rows.length === 0 && pageToLoad > 1 && pageToLoad > last) {
                setPage(Math.max(1, last));
                return;
            }

            setCategories(rows);
            setLastPage(last);
            setTotal(payload?.total ?? rows.length);
            setTotalAll(payload?.total_all ?? payload?.total ?? rows.length);
            setResponseFrom(payload?.from ?? null);
            setResponseTo(payload?.to ?? null);
        } catch (err) {
            if (myId !== requestIdRef.current) return;
            setAlertModal({
                show: true,
                type: "error",
                message:
                    err.response?.data?.message || "Unable to load categories.",
            });
        } finally {
            if (myId === requestIdRef.current) setLoading(false);
        }
    };

    // Debounce the search box
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Reload whenever page or search changes
    useEffect(() => {
        loadCategories(page);
        return () => {
            requestIdRef.current++;
        };
    }, [page, search]);

    // Close form modal on Escape key
    useEffect(() => {
        if (!showForm) return;
        const closeOnEscape = (e) => {
            if (e.key === "Escape" && !saving) setShowForm(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [showForm, saving]);

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    const editCategory = (category) => {
        setForm({
            name: category.name || "",
            description: category.description || "",
        });
        setEditingId(category.id);
        setShowForm(true);
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const wasEditing = Boolean(editingId);

            if (wasEditing) {
                await api.put(`/categories/${editingId}`, form);
            } else {
                await api.post("/categories", form);
            }

            setShowForm(false);
            setForm(emptyForm);
            setEditingId(null);

            // Edit: stay on the same page. Create: jump to page 1.
            if (!wasEditing && page !== 1) {
                setPage(1); // effect reloads
            } else {
                await loadCategories(page);
            }

            setAlertModal({
                show: true,
                type: "success",
                message: wasEditing
                    ? "Category updated successfully."
                    : "Category created successfully.",
            });
        } catch (err) {
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

            if (categories.length === 1 && page > 1) {
                setPage((current) => current - 1); // effect reloads
            } else {
                await loadCategories(page);
            }

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

    const goToPage = (nextPage) => {
        const newPage = Math.max(1, Math.min(nextPage, lastPage));
        if (newPage !== page) setPage(newPage);
    };

    // Compact page window: 1 ... 4 5 6 ... 20
    const getPageNumbers = () => {
        const pages = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(lastPage, page + 2);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("start-ellipsis");
        }
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < lastPage) {
            if (end < lastPage - 1) pages.push("end-ellipsis");
            pages.push(lastPage);
        }
        return pages;
    };

    const showingFrom = responseFrom ?? (total > 0 ? (page - 1) * PER_PAGE + 1 : 0);
    const showingTo = responseTo ?? Math.min(page * PER_PAGE, total);

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
                                <h3 className="fw-bold mb-0">{totalAll}</h3>
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
                                {total} categories found
                            </small>
                        </div>

                        <input
                            type="search"
                            className="form-control"
                            style={{ maxWidth: "320px" }}
                            placeholder="Search categories..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
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
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-5 text-secondary"
                                    >
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
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
                {!loading && lastPage > 0 && total > 0 && (
                    <div className="card-footer bg-white border-0 p-3">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                            <small className="text-secondary">
                                Showing {showingFrom} to {showingTo} of {total}{" "}
                                categories
                            </small>

                            <nav aria-label="Category pagination">
                                <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-center">
                                    <li
                                        className={`page-item ${page === 1 ? "disabled" : ""}`}
                                    >
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() => goToPage(page - 1)}
                                            disabled={page === 1 || loading}
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {getPageNumbers().map((number) =>
                                        typeof number === "string" ? (
                                            <li
                                                key={number}
                                                className="page-item disabled"
                                            >
                                                <span className="page-link">
                                                    …
                                                </span>
                                            </li>
                                        ) : (
                                            <li
                                                key={number}
                                                className={`page-item ${page === number ? "active" : ""}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="page-link"
                                                    onClick={() =>
                                                        goToPage(number)
                                                    }
                                                    disabled={loading}
                                                >
                                                    {number}
                                                </button>
                                            </li>
                                        ),
                                    )}

                                    <li
                                        className={`page-item ${page === lastPage ? "disabled" : ""}`}
                                    >
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() => goToPage(page + 1)}
                                            disabled={
                                                page === lastPage || loading
                                            }
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

            {/* ADD / EDIT CATEGORY FORM MODAL */}
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

            {/* SEPARATE SUCCESS/ERROR ALERT MODAL */}
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