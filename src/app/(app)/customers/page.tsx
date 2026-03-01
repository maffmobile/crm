"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, X, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const REGIONS = ["Toshkent sh.", "Toshkent vil.", "Samarqand", "Buxoro", "Farg'ona", "Andijon", "Namangan", "Qashqadaryo", "Surxondaryo", "Jizzax", "Sirdaryo", "Navoiy", "Xorazm", "Qoraqalpog'iston"];
const TAGS = ["VIP", "Muammolli", "Doimiy", "Yangi"];
const TAG_CLASS: Record<string, string> = { VIP: "chip chip-vip", Muammolli: "chip chip-muammo", Doimiy: "chip chip-doimiy" };

function formatDate(d: string) {
    return d ? new Date(d).toLocaleDateString("uz-UZ") : "—";
}

const emptyForm = {
    fullName: "", phone: "", extraPhone: "",
    region: "", district: "", address: "", notes: "", tags: [] as string[],
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const limit = 15;

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set("search", search);
        try {
            const res = await fetch(`/api/customers?${params}`);
            if (!res.ok) {
                const text = await res.text();
                console.error("API Error Text:", text);
                throw new Error(`Status: ${res.status}`);
            }
            const data = await res.json();
            setCustomers(data.customers || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Fetch customers error:", err);
            setError("Mijozlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError("");
        const res = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setShowCreate(false);
            setForm(emptyForm);
            fetchCustomers();
        } else {
            const data = await res.json();
            setError(data.error || "Saqlashda xatolik");
        }
        setSaving(false);
    };

    const toggleTag = (tag: string) => {
        setForm(f => ({
            ...f,
            tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
        }));
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>👥 Mijozlar</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Jami: {total} ta mijoz</p>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <Search className="search-icon" />
                        <input className="form-control" placeholder="Ism yoki telefon..." value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 280 }} />
                    </div>
                </div>
                <div className="toolbar-right">
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Yangi mijoz</button>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-center"><div className="spinner" /></div>
                    ) : customers.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">👤</div><p>Mijozlar topilmadi</p></div>
                    ) : (
                        <table>
                            <thead>
                                <tr><th>FIO</th><th>Telefon</th><th>Hudud</th><th>Teglar</th><th>Buyurtmalar</th><th>Sana</th><th></th></tr>
                            </thead>
                            <tbody>
                                {customers.map((c: any) => (
                                    <tr key={c.id}>
                                        <td><span className="primary">{c.fullName}</span></td>
                                        <td style={{ fontFamily: "monospace", fontSize: 13 }}>{c.phone}</td>
                                        <td style={{ fontSize: 12 }}>{c.region || "—"}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                {c.tags?.map((t: any) => (
                                                    <span key={t.id} className={TAG_CLASS[t.tag] || "chip"}>{t.tag}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td><span className="primary">{c._count?.orders ?? 0}</span></td>
                                        <td style={{ fontSize: 12 }}>{formatDate(c.createdAt)}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setSelected(c)}>
                                                <Eye size={12} /> Ko'rish
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>;
                    })}
                    <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
                </div>
            )}

            {/* DETAIL MODAL */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">👤 Mijoz ma'lumotlari</h2>
                            <button className="btn btn-secondary btn-icon" onClick={() => setSelected(null)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div><div className="form-label">To'liq ism</div><div className="primary fw-bold">{selected.fullName}</div></div>
                                <div><div className="form-label">Telefon</div><div style={{ fontFamily: "monospace" }}>{selected.phone}</div></div>
                                <div><div className="form-label">Qo'shimcha tel</div><div>{selected.extraPhone || "—"}</div></div>
                                <div><div className="form-label">Viloyat</div><div>{selected.region || "—"}</div></div>
                                <div><div className="form-label">Tuman</div><div>{selected.district || "—"}</div></div>
                                <div><div className="form-label">Manzil</div><div>{selected.address || "—"}</div></div>
                            </div>
                            {selected.tags?.length > 0 && (
                                <div>
                                    <div className="form-label mb-4">Teglar</div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {selected.tags.map((t: any) => <span key={t.id} className={TAG_CLASS[t.tag] || "chip"}>{t.tag}</span>)}
                                    </div>
                                </div>
                            )}
                            {selected.notes && (
                                <div><div className="form-label">Izoh</div><div style={{ fontSize: 13 }}>{selected.notes}</div></div>
                            )}
                            <div><div className="form-label">Ro'yxatdan o'tgan sana</div><div style={{ fontSize: 13 }}>{formatDate(selected.createdAt)}</div></div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">➕ Yangi mijoz</h2>
                            <button className="btn btn-secondary btn-icon" onClick={() => setShowCreate(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                {error && <div className="alert alert-error">{error}</div>}
                                <div className="form-grid">
                                    <div className="form-group form-col-full">
                                        <label className="form-label">To'liq ism *</label>
                                        <input required className="form-control" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Ism Familiya Otasining ismi" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Telefon *</label>
                                        <input required className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+998901234567" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Qo'shimcha telefon</label>
                                        <input className="form-control" value={form.extraPhone} onChange={e => setForm({ ...form, extraPhone: e.target.value })} placeholder="+998901234567" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Viloyat</label>
                                        <select className="form-control" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                                            <option value="">Tanlang</option>
                                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tuman</label>
                                        <input className="form-control" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="Tuman nomi" />
                                    </div>
                                    <div className="form-group form-col-full">
                                        <label className="form-label">To'liq manzil</label>
                                        <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Ko'cha, uy raqami" />
                                    </div>
                                    <div className="form-group form-col-full">
                                        <label className="form-label">Izoh</label>
                                        <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <div className="form-label" style={{ marginBottom: 8 }}>Teglar</div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {TAGS.map(tag => (
                                            <button key={tag} type="button"
                                                className={`chip ${form.tags.includes(tag) ? TAG_CLASS[tag] || "chip" : ""}`}
                                                style={{ cursor: "pointer", border: form.tags.includes(tag) ? undefined : "1px dashed var(--border)" }}
                                                onClick={() => toggleTag(tag)}>
                                                <Tag size={10} /> {tag}
                                            </button>
                                        ))}
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
