"use client";

import { X } from "lucide-react";

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

export function OrderDetailsModal({ selectedOrder, onClose, updateStatus }: { selectedOrder: any, onClose: () => void, updateStatus: (id: string, st: string) => void }) {
    if (!selectedOrder) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">📋 Buyurtma tafsiloti</h2>
                    <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">
                    <div className="form-grid">
                        <div>
                            <div className="form-label">Buyurtma raqami</div>
                            <div className="primary" style={{ fontFamily: "monospace", fontSize: 13 }}>{selectedOrder.orderNumber}</div>
                        </div>
                        <div>
                            <div className="form-label">Holat</div>
                            <span className={STATUS_BADGE[selectedOrder.status] || "badge"}>{STATUS_LABEL[selectedOrder.status]}</span>
                        </div>
                        <div>
                            <div className="form-label">Mijoz</div>
                            <div className="primary">{selectedOrder.customer?.fullName}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selectedOrder.customer?.phone}</div>
                        </div>
                        <div>
                            <div className="form-label">Manzil</div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                {[selectedOrder.customer?.region, selectedOrder.customer?.district, selectedOrder.customer?.address].filter(Boolean).join(", ") || "—"}
                            </div>
                        </div>
                        <div>
                            <div className="form-label">Shartnoma raqami</div>
                            <div style={{ fontSize: 13 }}>{selectedOrder.contractNumber || "—"}</div>
                        </div>
                        <div>
                            <div className="form-label">Tracking raqami</div>
                            <div style={{ fontSize: 13 }}>{selectedOrder.trackingNumber || "—"}</div>
                        </div>
                        <div>
                            <div className="form-label">Yetkazib berish</div>
                            <span className="badge" style={{ background: "rgba(99,102,241,0.1)", color: "var(--accent-primary)" }}>
                                {selectedOrder.deliveryType === "UZPOST" ? "UzPost" : "Kuryer"}
                            </span>
                        </div>
                        <div>
                            <div className="form-label">Hujjatlar</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                {selectedOrder.receiptUrl ? <a href={selectedOrder.receiptUrl} target="_blank" className="btn btn-secondary btn-sm">Chek</a> : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Chek yo'q</span>}
                                {selectedOrder.contractUrl ? <a href={selectedOrder.contractUrl} target="_blank" className="btn btn-secondary btn-sm">Shartnoma</a> : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Shartnoma yo'q</span>}
                            </div>
                        </div>
                    </div>

                    <div className="divider" />
                    <div className="form-label" style={{ marginBottom: 8 }}>Mahsulotlar</div>
                    {selectedOrder.items?.map((item: any) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 13 }}>{item.product?.name}</span>
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.quantity} x {formatSum(item.priceAtSale)}</span>
                        </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                        <strong>Jami: {formatSum(selectedOrder.totalSum)}</strong>
                    </div>

                    {selectedOrder.notes && (
                        <>
                            <div className="divider" />
                            <div><div className="form-label">Izoh</div><div style={{ fontSize: 13 }}>{selectedOrder.notes}</div></div>
                        </>
                    )}

                    {/* STATUS ACTIONS */}
                    {NEXT_STATUSES[selectedOrder.status]?.length > 0 && (
                        <>
                            <div className="divider" />
                            <div>
                                <div className="form-label" style={{ marginBottom: 8 }}>Holat o'zgartirish</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                                    {NEXT_STATUSES[selectedOrder.status].map(st => (
                                        <button key={st} className={`btn btn-sm ${st === "BEKOR_QILINDI" || st === "QAYTARILDI" ? "btn-danger" : "btn-success"}`}
                                            onClick={() => updateStatus(selectedOrder.id, st)}>
                                            {STATUS_LABEL[st]} ni belgilash
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* STATUS LOG */}
                    {selectedOrder.statusLogs?.length > 0 && (
                        <>
                            <div className="divider" />
                            <div className="form-label" style={{ marginBottom: 8 }}>Tarix</div>
                            <div className="timeline">
                                {selectedOrder.statusLogs.map((log: any) => (
                                    <div key={log.id} className="timeline-item">
                                        <div className="timeline-dot">✓</div>
                                        <div className="timeline-content">
                                            <div className="timeline-title">{STATUS_LABEL[log.newStatus] || log.newStatus}</div>
                                            <div className="timeline-time">{log.changedBy?.fullName} · {formatDate(log.changedAt)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
