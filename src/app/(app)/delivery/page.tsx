"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Package, Truck, CheckCircle, XCircle } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
    OMBORGA_YUBORILDI: "badge badge-ombor", POCHTAGA_TOPSHIRILDI: "badge badge-pochta",
    YOLDA: "badge badge-yolda", YETKAZILDI: "badge badge-yetkazildi", QAYTARILDI: "badge badge-qaytarildi",
};
const STATUS_LABEL: Record<string, string> = {
    OMBORGA_YUBORILDI: "Omborga yuborildi", POCHTAGA_TOPSHIRILDI: "Pochtaga topshirildi",
    YOLDA: "Yo'lda", YETKAZILDI: "Yetkazildi", QAYTARILDI: "Qaytarildi",
};
const NEXT_STATUS: Record<string, string[]> = {
    OMBORGA_YUBORILDI: ["POCHTAGA_TOPSHIRILDI"],
    POCHTAGA_TOPSHIRILDI: ["YOLDA"],
    YOLDA: ["YETKAZILDI", "QAYTARILDI"],
    YETKAZILDI: [], QAYTARILDI: [],
};

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString("uz-UZ") : "—"; }
function formatSum(n: number) { return new Intl.NumberFormat("uz-UZ").format(n) + " UZS"; }

export default function DeliveryPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [deliveryFilter, setDeliveryFilter] = useState(""); // UZPOST, KURYER, or ""
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, inTransit: 0, delivered: 0, returned: 0 });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const statuses = ["OMBORGA_YUBORILDI", "POCHTAGA_TOPSHIRILDI", "YOLDA"];
        const results = await Promise.all(
            statuses.map(s => fetch(`/api/orders?status=${s}&limit=100`).then(r => r.json()))
        );
        const delivered = await fetch("/api/orders?status=YETKAZILDI&limit=1").then(r => r.json());
        const returned = await fetch("/api/orders?status=QAYTARILDI&limit=1").then(r => r.json());

        const allOrders = results.flatMap(r => r.orders || []);
        const filtered = allOrders.filter((o: any) => {
            const matchesSearch = !search ||
                o.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                o.customer?.phone?.includes(search) ||
                o.trackingNumber?.includes(search);
            const matchesDelivery = !deliveryFilter || o.deliveryType === deliveryFilter;
            return matchesSearch && matchesDelivery;
        });

        setOrders(filtered);
        setTotal(filtered.length);
        setStats({
            pending: (results[0]?.total || 0),
            inTransit: (results[2]?.total || 0),
            delivered: delivered?.total || 0,
            returned: returned?.total || 0,
        });
        setLoading(false);
    }, [search, deliveryFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        const body: any = { status: newStatus };
        if (newStatus === "YOLDA") {
            const tracking = prompt("Tracking raqamini kiriting:");
            if (!tracking) return;
            body.trackingNumber = tracking;
        }
        await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        fetchOrders();
    };

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>🚚 Yetkazib berish</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Pochta bo'limi ish paneli</p>
            </div>

            {/* STATS */}
            <div className="stats-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card yellow">
                    <div className="stat-icon yellow"><Package size={20} /></div>
                    <div className="stat-label">Kutmoqda (ombor)</div>
                    <div className="stat-value">{stats.pending}</div>
                </div>
                <div className="stat-card pink">
                    <div className="stat-icon pink"><Truck size={20} /></div>
                    <div className="stat-label">Yo'lda</div>
                    <div className="stat-value">{stats.inTransit}</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green"><CheckCircle size={20} /></div>
                    <div className="stat-label">Yetkazildi</div>
                    <div className="stat-value">{stats.delivered}</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-icon blue" style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent-danger)" }}><XCircle size={20} /></div>
                    <div className="stat-label">Qaytarildi</div>
                    <div className="stat-value">{stats.returned}</div>
                </div>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <Search className="search-icon" />
                        <input className="form-control" placeholder="Mijoz, telefon, tracking..." value={search}
                            onChange={e => setSearch(e.target.value)} style={{ width: 280 }} />
                    </div>
                    <select className="form-control" value={deliveryFilter} onChange={e => setDeliveryFilter(e.target.value)} style={{ width: 160 }}>
                        <option value="">Barcha turlar</option>
                        <option value="UZPOST">UzPost</option>
                        <option value="KURYER">Kuryer (O'zimiz)</option>
                    </select>
                    <button className="btn btn-secondary btn-icon" onClick={fetchOrders}><RefreshCw size={14} /></button>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Faol buyurtmalar: {total}</div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? <div className="loading-center"><div className="spinner" /></div>
                        : orders.length === 0 ? <div className="empty-state"><div className="empty-state-icon">✅</div><p>Hamma buyurtmalar qayta ishlangan</p></div>
                            : (
                                <table>
                                    <thead>
                                        <tr><th>Mijoz</th><th>Mahsulot</th><th>Manzil</th><th>Tur</th><th>Tracking/Files</th><th>Holat</th><th>Amal</th></tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((o: any) => (
                                            <tr key={o.id}>
                                                <td>
                                                    <div className="primary">{o.customer?.fullName}</div>
                                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.customer?.phone}</div>
                                                </td>
                                                <td style={{ fontSize: 12 }}>{o.items?.map((i: any) => i.product?.name).join(", ")}</td>
                                                <td style={{ fontSize: 12 }}>
                                                    <div>{o.customer?.region} {o.customer?.district && `/ ${o.customer.district}`}</div>
                                                    {o.postalIndex && <div style={{ color: "var(--accent-primary)", fontWeight: 600 }}>📮 {o.postalIndex}</div>}
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "var(--accent-primary)" }}>
                                                        {o.deliveryType === "UZPOST" ? "UzPost" : "Kuryer"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {o.trackingNumber && <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent-success)" }}>{o.trackingNumber}</div>}
                                                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                                        {o.receiptUrl && <a href={o.receiptUrl} target="_blank" className="btn btn-secondary btn-xs" style={{ padding: "2px 4px", fontSize: 10 }}>Chek</a>}
                                                        {o.contractUrl && <a href={o.contractUrl} target="_blank" className="btn btn-secondary btn-xs" style={{ padding: "2px 4px", fontSize: 10 }}>Kontrakt</a>}
                                                    </div>
                                                </td>
                                                <td><span className={STATUS_BADGE[o.status] || "badge"}>{STATUS_LABEL[o.status] || o.status}</span></td>
                                                <td>
                                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                        {NEXT_STATUS[o.status]?.map(ns => (
                                                            <button key={ns} className={`btn btn-sm ${ns === "QAYTARILDI" ? "btn-danger" : "btn-success"}`}
                                                                onClick={() => updateStatus(o.id, ns)}>
                                                                {STATUS_LABEL[ns]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                </div>
            </div>
        </div>
    );
}
