"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Eye, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { CreateOrderModal } from "@/components/CreateOrderModal";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

const STATUSES = [
    { value: "", label: "Barcha holat" },
    { value: "YANGI", label: "Yangi" },
    { value: "QAYTA_ALOQA", label: "Qayta aloqa" },
    { value: "TASDIQLANDI", label: "Tasdiqlandi" },
    { value: "POCHTAGA_TOPSHIRILDI", label: "Pochtaga topshirildi" },
    { value: "YOLDA", label: "Yo'lda" },
    { value: "YETKAZILDI", label: "Topshirildi" },
    { value: "QAYTARILDI", label: "Qaytarildi" },
    { value: "BEKOR_QILINDI", label: "Bekor qilindi" },
];

const STATUS_BADGE: Record<string, string> = {
    YANGI: "badge badge-yangi",
    QAYTA_ALOQA: "badge badge-ombor",
    TASDIQLANDI: "badge badge-tasdiqlandi",
    POCHTAGA_TOPSHIRILDI: "badge badge-pochta",
    YOLDA: "badge badge-yolda",
    YETKAZILDI: "badge badge-yetkazildi",
    QAYTARILDI: "badge badge-qaytarildi",
    BEKOR_QILINDI: "badge badge-bekor",
};

const STATUS_LABEL: Record<string, string> = {
    YANGI: "Yangi",
    QAYTA_ALOQA: "Qayta aloqa",
    TASDIQLANDI: "Tasdiqlandi",
    POCHTAGA_TOPSHIRILDI: "Pochtaga topshirildi",
    YOLDA: "Yo'lda",
    YETKAZILDI: "Topshirildi",
    QAYTARILDI: "Qaytarildi",
    BEKOR_QILINDI: "Bekor qilindi",
};

const NEXT_STATUSES: Record<string, string[]> = {
    YANGI: ["QAYTA_ALOQA", "TASDIQLANDI", "BEKOR_QILINDI"],
    QAYTA_ALOQA: ["TASDIQLANDI", "BEKOR_QILINDI"],
    TASDIQLANDI: ["POCHTAGA_TOPSHIRILDI", "BEKOR_QILINDI"],
    POCHTAGA_TOPSHIRILDI: ["YOLDA"],
    YOLDA: ["YETKAZILDI", "QAYTARILDI"],
    YETKAZILDI: [], QAYTARILDI: [], BEKOR_QILINDI: [],
};

function formatDate(d: string) {
    return d ? new Date(d).toLocaleDateString("uz-UZ") : "—";
}
function formatSum(n: number) {
    return new Intl.NumberFormat("uz-UZ").format(n) + " UZS";
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const limit = 15;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        const res = await fetch(`/api/orders?${params}`);
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setLoading(false);
    }, [page, search, statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const openCreate = async () => {
        const [cRes, pRes] = await Promise.all([fetch("/api/customers?limit=200"), fetch("/api/products?active=true")]);
        const cData = await cRes.json();
        const pData = await pRes.json();
        setCustomers(cData.customers || []);
        setProducts(pData || []);
        setShowCreate(true);
    };

    const handleCreateSuccess = () => {
        setShowCreate(false);
        fetchOrders();
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const trackingNumber = newStatus === "YOLDA" ? prompt("Tracking raqamini kiriting:") : undefined;
        const body: any = { status: newStatus };
        if (trackingNumber) body.trackingNumber = trackingNumber;
        await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
            const res = await fetch(`/api/orders/${orderId}`);
            setSelectedOrder(await res.json());
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>🛒 Buyurtmalar</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Jami: {total} ta buyurtma</p>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <Search className="search-icon" />
                        <input className="form-control" placeholder="Qidirish..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 260 }} />
                    </div>
                    <select className="form-control" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 200 }}>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button className="btn btn-secondary btn-icon" onClick={fetchOrders} title="Yangilash"><RefreshCw size={14} /></button>
                </div>
                <div className="toolbar-right">
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Yangi buyurtma</button>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-center"><div className="spinner" /></div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">📦</div><p>Buyurtmalar topilmadi</p></div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th><th>Mijoz</th><th>Mahsulotlar</th><th>Summa</th>
                                    <th>Holat</th><th>Operator</th><th>Sana</th><th>Amal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o: any) => (
                                    <tr key={o.id}>
                                        <td>
                                            <span className="primary" style={{ fontSize: 12, fontFamily: "monospace" }}>{o.orderNumber?.slice(0, 8)}...</span>
                                            {o.contractNumber && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.contractNumber}</div>}
                                        </td>
                                        <td>
                                            <div className="primary">{o.customer?.fullName}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.customer?.phone}</div>
                                            {o.customer?.region && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.customer.region}</div>}
                                        </td>
                                        <td>
                                            {o.items?.slice(0, 2).map((item: any) => (
                                                <div key={item.id} style={{ fontSize: 12, color: "var(--text-secondary)" }}>• {item.product?.name} ({item.quantity})</div>
                                            ))}
                                            {o.items?.length > 2 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>+{o.items.length - 2} ta</div>}
                                        </td>
                                        <td><span className="primary">{formatSum(o.totalSum)}</span></td>
                                        <td>
                                            <span className={STATUS_BADGE[o.status] || "badge"}>
                                                {STATUS_LABEL[o.status] || o.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12 }}>{o.operator?.fullName}</td>
                                        <td style={{ fontSize: 12 }}>{formatDate(o.createdAt)}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={async () => {
                                                const res = await fetch(`/api/orders/${o.id}`);
                                                setSelectedOrder(await res.json());
                                            }}>
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

            {
                totalPages > 1 && (
                    <div className="pagination">
                        <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                            return <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>;
                        })}
                        <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
                    </div>
                )
            }

            {
                selectedOrder && (
                    <OrderDetailsModal
                        selectedOrder={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        updateStatus={updateStatus}
                    />
                )
            }

            {/* CREATE ORDER MODAL */}
            {
                showCreate && (
                    <CreateOrderModal
                        onClose={() => setShowCreate(false)}
                        onSuccess={handleCreateSuccess}
                        customers={customers}
                        products={products}
                    />
                )
            }
        </div >
    );
}
