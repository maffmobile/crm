"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, Edit2 } from "lucide-react";

const CATEGORIES = ["Elektronika", "Uy jihozlari", "Kiyim", "Sport", "Oziq-ovqat", "Boshqa"];

const emptyForm = { name: "", category: "", price: 0, stock: 0, sku: "", description: "", isActive: true };

function formatSum(n: number) { return new Intl.NumberFormat("uz-UZ").format(n) + " UZS"; }

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts(data || []);
        setLoading(false);
    }, [search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const openCreate = () => { setForm(emptyForm); setEditing(null); setShowCreate(true); };
    const openEdit = (p: any) => { setForm({ name: p.name, category: p.category || "", price: p.price, stock: p.stock, sku: p.sku || "", description: p.description || "", isActive: p.isActive }); setEditing(p); setShowCreate(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError("");
        const method = editing ? "PATCH" : "POST";
        const body = editing ? { ...form, id: editing.id } : form;
        const res = await fetch("/api/products", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (res.ok) { setShowCreate(false); fetchProducts(); }
        else { setError("Saqlashda xatolik"); }
        setSaving(false);
    };

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>📦 Mahsulotlar katalogi</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Jami: {products.length} ta mahsulot</p>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <Search className="search-icon" />
                        <input className="form-control" placeholder="Mahsulot qidirish..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
                    </div>
                </div>
                <div className="toolbar-right">
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Yangi mahsulot</button>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? <div className="loading-center"><div className="spinner" /></div>
                        : products.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📭</div><p>Mahsulotlar topilmadi</p></div>
                            : (
                                <table>
                                    <thead><tr><th>Mahsulot nomi</th><th>Kategoriya</th><th>SKU</th><th>Narx</th><th>Zaxira</th><th>Holat</th><th></th></tr></thead>
                                    <tbody>
                                        {products.map((p: any) => (
                                            <tr key={p.id}>
                                                <td><span className="primary">{p.name}</span></td>
                                                <td style={{ fontSize: 12 }}>{p.category || "—"}</td>
                                                <td style={{ fontSize: 12, fontFamily: "monospace" }}>{p.sku || "—"}</td>
                                                <td><span className="primary">{formatSum(p.price)}</span></td>
                                                <td>
                                                    <span style={{ color: p.stock <= 5 ? "var(--accent-danger)" : p.stock <= 20 ? "var(--accent-warning)" : "var(--accent-success)", fontWeight: 600 }}>
                                                        {p.stock} ta
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${p.isActive ? "badge-yetkazildi" : "badge-bekor"}`}>{p.isActive ? "Faol" : "Nofaol"}</span>
                                                </td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Edit2 size={12} /> Tahrirlash</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                </div>
            </div>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? "✏️ Mahsulotni tahrirlash" : "➕ Yangi mahsulot"}</h2>
                            <button className="btn btn-secondary btn-icon" onClick={() => setShowCreate(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && <div className="alert alert-error">{error}</div>}
                                <div className="form-grid">
                                    <div className="form-group form-col-full">
                                        <label className="form-label">Mahsulot nomi *</label>
                                        <input required className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Kategoriya</label>
                                        <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            <option value="">Tanlang</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">SKU / Kod</label>
                                        <input className="form-control" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="PRD-001" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Narx (UZS)</label>
                                        <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Zaxira (dona)</label>
                                        <input type="number" className="form-control" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })} min="0" />
                                    </div>
                                    <div className="form-group form-col-full">
                                        <label className="form-label">Tavsif</label>
                                        <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Holat</label>
                                        <select className="form-control" value={String(form.isActive)} onChange={e => setForm({ ...form, isActive: e.target.value === "true" })}>
                                            <option value="true">Faol</option>
                                            <option value="false">Nofaol</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Bekor</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
