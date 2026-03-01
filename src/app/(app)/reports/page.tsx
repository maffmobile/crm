"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

function formatSum(n: number) { return new Intl.NumberFormat("uz-UZ").format(n) + " UZS"; }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString("uz-UZ") : "—"; }

const STATUS_LABEL: Record<string, string> = {
    YANGI: "Yangi", TASDIQLANDI: "Tasdiqlandi", OMBORGA_YUBORILDI: "Omborga yuborildi",
    POCHTAGA_TOPSHIRILDI: "Pochtaga topshirildi", YOLDA: "Yolda",
    YETKAZILDI: "Yetkazildi", QAYTARILDI: "Qaytarildi", BEKOR_QILINDI: "Bekor qilindi",
};

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetch("/api/stats").then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const exportOrders = async () => {
        setExporting(true);
        const res = await fetch("/api/orders?limit=1000");
        const data = await res.json();
        const orders = data.orders || [];

        const rows = orders.map((o: any) => ({
            "Buyurtma raqami": o.orderNumber,
            "Shartnoma raqami": o.contractNumber || "",
            "Mijoz": o.customer?.fullName || "",
            "Telefon": o.customer?.phone || "",
            "Viloyat": o.customer?.region || "",
            "Manzil": o.customer?.address || "",
            "Mahsulotlar": o.items?.map((i: any) => `${i.product?.name} (${i.quantity})`).join("; "),
            "Summa": o.totalSum,
            "Holat": STATUS_LABEL[o.status] || o.status,
            "Tracking": o.trackingNumber || "",
            "Operator": o.operator?.fullName || "",
            "Sana": formatDate(o.createdAt),
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Buyurtmalar");
        XLSX.writeFile(wb, `Buyurtmalar_${new Date().toLocaleDateString("uz-UZ")}.xlsx`);
        setExporting(false);
    };

    if (loading) return <div className="page-content"><div className="loading-center"><div className="spinner" style={{ width: 40, height: 40 }} /></div></div>;

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800 }}>📈 Hisobotlar</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Tizim ko'rsatkichlari va eksport</p>
                </div>
                <button className="btn btn-primary" onClick={exportOrders} disabled={exporting}>
                    <Download size={14} /> {exporting ? "Eksport qilinmoqda..." : "Excel eksport"}
                </button>
            </div>

            {stats && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-label">Jami buyurtmalar</div>
                            <div className="stat-value">{stats.totalOrders}</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-label">Jami tushum</div>
                            <div className="stat-value" style={{ fontSize: 18 }}>{formatSum(stats.totalRevenue)}</div>
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-label">Oylik tushum</div>
                            <div className="stat-value" style={{ fontSize: 18 }}>{formatSum(stats.monthRevenue)}</div>
                        </div>
                        <div className="stat-card yellow">
                            <div className="stat-label">Muvaffaqiyatli yetkazish</div>
                            <div className="stat-value">{stats.deliveryRate}%</div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div className="card card-padded">
                            <h3 className="section-title">Holat bo'yicha taqsimot</h3>
                            <table style={{ width: "100%" }}>
                                <thead><tr><th>Holat</th><th style={{ textAlign: "right" }}>Soni</th></tr></thead>
                                <tbody>
                                    {stats.ordersByStatus?.map((row: any) => (
                                        <tr key={row.status}>
                                            <td>{STATUS_LABEL[row.status] || row.status}</td>
                                            <td style={{ textAlign: "right", fontWeight: 600 }}>{row._count?.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="card card-padded">
                            <h3 className="section-title">🏆 Top mahsulotlar</h3>
                            {stats.topProducts?.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: 13 }}>Ma'lumot yo'q</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {stats.topProducts?.map((p: any, i: number) => (
                                        <div key={p.productId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent-secondary)", flexShrink: 0 }}>{i + 1}</div>
                                            <div style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                            <div style={{ fontWeight: 600, color: "var(--accent-success)", fontSize: 13 }}>{p._sum?.quantity} ta</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card card-padded" style={{ marginTop: 16 }}>
                        <h3 className="section-title">👥 Jamoalar faoliyati (Muvaffaqiyatli yetkazilgan)</h3>
                        {stats.teamsBreakdown?.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: 13 }}>Hozircha jamoalar yo'q</p>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Jamoa nomi</th><th style={{ textAlign: "right" }}>Yetkazilgan buyurtmalar</th></tr></thead>
                                    <tbody>
                                        {stats.teamsBreakdown?.map((t: any) => (
                                            <tr key={t.id}>
                                                <td><span className="primary">{t.name}</span></td>
                                                <td style={{ textAlign: "right", fontWeight: 700, color: "var(--accent-success)" }}>{t.deliveredOrders} ta</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
