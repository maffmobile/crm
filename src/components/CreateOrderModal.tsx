"use client";

import { useState, useEffect } from "react";
import { Plus, X, Upload, FileText, Image as ImageIcon } from "lucide-react";

export function CreateOrderModal({ onClose, onSuccess, customers, products }: { onClose: () => void, onSuccess: () => void, customers: any[], products: any[] }) {
    const [form, setForm] = useState({
        customerId: "",
        customer: { fullName: "", phone: "", region: "", district: "", address: "" },
        customerType: "EXISTING" as "EXISTING" | "NEW",
        contractNumber: "",
        postalIndex: "",
        notes: "",
        deliveryType: "UZPOST",
        receiptUrl: "",
        contractUrl: "",
        items: [{ productId: "", quantity: 1, priceAtSale: 0 }]
    });
    const [saving, setSaving] = useState(false);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [uploadingContract, setUploadingContract] = useState(false);
    const [error, setError] = useState("");

    const handleFileUpload = async (file: File, type: "receipt" | "contract") => {
        const setUploading = type === "receipt" ? setUploadingReceipt : setUploadingContract;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setForm(prev => ({
                    ...prev,
                    [type === "receipt" ? "receiptUrl" : "contractUrl"]: data.url
                }));
            } else {
                setError("Fayl yuklashda xatolik");
            }
        } catch (err) {
            setError("Serverga ulanishda xatolik");
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError("");
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                customerId: form.customerType === "EXISTING" ? form.customerId : null,
                customer: form.customerType === "NEW" ? form.customer : null
            })
        });
        if (res.ok) {
            onSuccess();
        } else {
            setError("Saqlashda xatolik");
        }
        setSaving(false);
    };

    const updateFormItem = (i: number, field: string, value: any) => {
        const items = [...form.items];
        items[i] = { ...items[i], [field]: value };
        if (field === "productId") {
            const prod = products.find((p: any) => p.id === value);
            if (prod) items[i].priceAtSale = prod.price;
        }
        setForm({ ...form, items });
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
                <div className="modal-header">
                    <h2 className="modal-title">➕ Yangi buyurtma</h2>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                {error && <div className="alert alert-danger" style={{ margin: "0 24px 16px" }}>{error}</div>}

                <form onSubmit={handleCreate}>
                    <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Mijoz ma'lumotlari */}
                        <div className="card card-padded" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                            <h3 style={{ fontSize: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>1. Mijoz ma'lumotlari</span>
                                <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, customerType: "EXISTING" })}
                                        style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, border: "none", cursor: "pointer", background: form.customerType === "EXISTING" ? "var(--accent-primary)" : "transparent", color: form.customerType === "EXISTING" ? "#fff" : "var(--text-secondary)" }}
                                    >Bazadan</button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, customerType: "NEW" })}
                                        style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, border: "none", cursor: "pointer", background: form.customerType === "NEW" ? "var(--accent-primary)" : "transparent", color: form.customerType === "NEW" ? "#fff" : "var(--text-secondary)" }}
                                    >Yangi</button>
                                </div>
                            </h3>

                            {form.customerType === "EXISTING" ? (
                                <div className="form-group">
                                    <label className="form-label">Mijozni tanlang *</label>
                                    <select required className="form-control" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                                        <option value="">Tanlash...</option>
                                        {customers.map((c: any) => <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">F.I.SH *</label>
                                        <input required className="form-control" value={form.customer.fullName} onChange={e => setForm({ ...form, customer: { ...form.customer, fullName: e.target.value } })} placeholder="To'liq ism" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Telefon *</label>
                                        <input required className="form-control" value={form.customer.phone} onChange={e => setForm({ ...form, customer: { ...form.customer, phone: e.target.value } })} placeholder="+998" />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <div className="form-group">
                                            <label className="form-label">Viloyat</label>
                                            <input className="form-control" value={form.customer.region} onChange={e => setForm({ ...form, customer: { ...form.customer, region: e.target.value } })} placeholder="Viloyat" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Tuman</label>
                                            <input className="form-control" value={form.customer.district} onChange={e => setForm({ ...form, customer: { ...form.customer, district: e.target.value } })} placeholder="Tuman" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Yetkazib berish turi</label>
                                <select className="form-control" value={form.deliveryType} onChange={e => setForm({ ...form, deliveryType: e.target.value })}>
                                    <option value="UZPOST">O'zbekiston Pochtasi (UzPost)</option>
                                    <option value="KURYER">Kuryer orqali (BTS/Fargo/Yandex)</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Shartnoma raqami</label>
                                <input className="form-control" value={form.contractNumber} onChange={e => setForm({ ...form, contractNumber: e.target.value })} placeholder="Shartnoma raqami" />
                            </div>
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Pochta indeksi</label>
                                <input className="form-control" value={form.postalIndex} onChange={e => setForm({ ...form, postalIndex: e.target.value })} placeholder="Indeks" />
                            </div>
                        </div>

                        {/* Mahsulotlar & Hujjatlar */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div className="card card-padded" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                                <h3 style={{ fontSize: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>2. Mahsulotlar</span>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm({ ...form, items: [...form.items, { productId: "", quantity: 1, priceAtSale: 0 }] })}><Plus size={12} /> Qo'shish</button>
                                </h3>
                                {form.items.map((item, i) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 40px", gap: 12, marginBottom: 12, alignItems: "center" }}>
                                        <select required className="form-control" value={item.productId} onChange={e => updateFormItem(i, "productId", e.target.value)}>
                                            <option value="">Mahsulot...</option>
                                            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} - {p.price} UZS</option>)}
                                        </select>
                                        <input required type="number" min="1" className="form-control" value={item.quantity} onChange={e => updateFormItem(i, "quantity", parseInt(e.target.value))} />
                                        <button type="button" className="btn btn-danger btn-icon" onClick={() => {
                                            const items = form.items.filter((_, idx) => idx !== i);
                                            setForm({ ...form, items });
                                        }} disabled={form.items.length === 1}><X size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="card card-padded" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                                <h3 style={{ fontSize: 14, marginBottom: 16 }}>3. Hujjatlar va Izoh</h3>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Chek (Yuklash)</label>
                                        <div style={{ position: "relative" }}>
                                            <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "receipt")} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
                                            <div className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                                                {uploadingReceipt ? <div className="spinner" style={{ width: 14, height: 14 }} /> : form.receiptUrl ? <><CheckCircle size={14} className="text-success" /> Yuklandi</> : <><Upload size={14} /> Fayl tanlash</>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Shartnoma (Yuklash)</label>
                                        <div style={{ position: "relative" }}>
                                            <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "contract")} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
                                            <div className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                                                {uploadingContract ? <div className="spinner" style={{ width: 14, height: 14 }} /> : form.contractUrl ? <><CheckCircle size={14} className="text-success" /> Yuklandi</> : <><Upload size={14} /> Fayl tanlash</>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Izoh</label>
                                    <textarea className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Buyurtma haqida eslatmalar..." />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <span style={{ fontWeight: 800, fontSize: 16 }}>
                            Jami: {new Intl.NumberFormat("uz-UZ").format(form.items.reduce((s, item) => s + (item.priceAtSale * (item.quantity || 1)), 0))} UZS
                        </span>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Bekor</button>
                            <button type="submit" className="btn btn-primary" disabled={saving || form.items.some(i => !i.productId)}>
                                {saving ? "Saqlanmoqda..." : "Yaratish"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
