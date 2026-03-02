"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Clock, CheckCircle, Truck, Phone, MapPin, Plus, MessageSquare, Ship, CheckCircle2 } from "lucide-react";

import { CreateOrderModal } from "@/components/CreateOrderModal";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

const COLUMNS = [
    { id: "YANGI", title: "Yangi", icon: <Clock size={16} />, color: "var(--accent-primary)" },
    { id: "QAYTA_ALOQA", title: "Qayta aloqa", icon: <MessageSquare size={16} />, color: "var(--accent-warning)" },
    { id: "TASDIQLANDI", title: "Tasdiqlandi", icon: <CheckCircle size={16} />, color: "var(--accent-success)" },
    { id: "POCHTAGA_TOPSHIRILDI", title: "Pochtaga topsh.", icon: <Truck size={16} />, color: "var(--accent-info)" },
    { id: "YOLDA", title: "Yo'lda", icon: <Ship size={16} />, color: "var(--accent-secondary)" },
    { id: "YETKAZILDI", title: "Topshirildi", icon: <CheckCircle2 size={16} />, color: "#10b981" },
];

function formatSum(n: number) { return new Intl.NumberFormat("uz-UZ").format(n) + " UZS"; }

export default function VoronkaPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDnDActive, setIsDnDActive] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Scrollbar state — stored as percentages to avoid trackRef dependency
    const [thumbWidthPct, setThumbWidthPct] = useState(20);
    const [thumbLeftPct, setThumbLeftPct] = useState(0);
    const [canScroll, setCanScroll] = useState(false);

    // 🕒 Highlight new leads (created in last 30 minutes)
    const isNewLead = (createdAt: string) => {
        const diff = Date.now() - new Date(createdAt).getTime();
        return diff < 30 * 60 * 1000;
    };

    // Update custom scrollbar thumb
    const updateScrollbar = useCallback(() => {
        const c = scrollContainerRef.current;
        if (!c) return;

        const scrollWidth = c.scrollWidth;
        const clientWidth = c.clientWidth;
        const scrollLeft = c.scrollLeft;

        const scrollable = scrollWidth > clientWidth + 1;
        setCanScroll(scrollable);

        if (!scrollable) {
            setThumbWidthPct(100);
            setThumbLeftPct(0);
        }

        // Calculate width: visible / total. 
        // We cap it at 90% to ensure there's always room to move if scrollable.
        let widthPct = (clientWidth / scrollWidth) * 100;
        widthPct = Math.max(Math.min(widthPct, 90), 10);

        const maxScrollLeft = scrollWidth - clientWidth;
        const leftPct = maxScrollLeft > 0
            ? (scrollLeft / maxScrollLeft) * (100 - widthPct)
            : 0;

        setThumbWidthPct(widthPct);
        setThumbLeftPct(leftPct);
    }, []);

    // 🖱 Horizontal Scroll with Mouse Wheel & Drag-to-Scroll
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let isDown = false;
        let startX: number;
        let scrollStart: number;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                container.scrollLeft += e.deltaY;
                e.preventDefault();
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (isDnDActive) return;
            const target = e.target as HTMLElement;
            if (target.closest('.kanban-card') || target.closest('button') || target.closest('.badge-new')) return;
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollStart = container.scrollLeft;
            document.body.style.userSelect = 'none';
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollStart - walk;
        };

        const handleMouseUp = () => {
            if (!isDown) return;
            isDown = false;
            container.style.cursor = 'grab';
            document.body.style.userSelect = '';
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("mousedown", handleMouseDown, true);
        container.addEventListener("scroll", updateScrollbar);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("resize", updateScrollbar);

        setTimeout(updateScrollbar, 100);

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("mousedown", handleMouseDown, true);
            container.removeEventListener("scroll", updateScrollbar);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("resize", updateScrollbar);
        };
    }, [isDnDActive, updateScrollbar]);

    // Update scrollbar when orders load
    useEffect(() => {
        const t = setTimeout(updateScrollbar, 200);
        return () => clearTimeout(t);
    }, [orders, updateScrollbar]);

    // Drag thumb
    const handleThumbMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const container = scrollContainerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;

        const startX = e.pageX;
        const startScroll = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const trackRect = track.getBoundingClientRect();

        const trackPx = trackRect.width;
        const thumbPx = (thumbWidthPct / 100) * trackPx;

        const onMove = (ev: MouseEvent) => {
            const dx = ev.pageX - startX;
            // Ratio of drag relative to available track space (track width - thumb width)
            const scrollRatio = dx / (trackPx - thumbPx);
            const newScroll = Math.max(0, Math.min(startScroll + scrollRatio * maxScroll, maxScroll));
            container.scrollLeft = newScroll;
            updateScrollbar(); // Force update thumb position immediately
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    // Click on track to jump
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        const trackWidth = rect.width;
        const thumbWidthPx = (thumbWidthPct / 100) * trackWidth;
        const maxScroll = container.scrollWidth - container.clientWidth;

        let ratio;
        if (trackWidth <= thumbWidthPx) {
            ratio = 0;
        } else {
            ratio = (clickX - thumbWidthPx / 2) / (trackWidth - thumbWidthPx);
        }

        const targetScroll = Math.max(0, Math.min(ratio * maxScroll, maxScroll));
        container.scrollLeft = targetScroll;
    };

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [preloadingData, setPreloadingData] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders?limit=200");
            const data = await res.json();
            const activeOrders = (data.orders || []).filter((o: any) =>
                COLUMNS.map(c => c.id).includes(o.status)
            );
            setOrders(activeOrders);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const prefetchData = async () => {
        setPreloadingData(true);
        try {
            const [cRes, pRes] = await Promise.all([
                fetch("/api/customers?limit=200"),
                fetch("/api/products?active=true")
            ]);
            const cData = await cRes.json();
            const pData = await pRes.json();
            setCustomers(cData.customers || []);
            setProducts(pData || []);
        } catch (e) {
            console.error("Prefetch error:", e);
        } finally {
            setPreloadingData(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        prefetchData();
    }, []);

    const openCreate = () => {
        setShowCreate(true);
    };

    const handleCreateSuccess = () => { setShowCreate(false); fetchOrders(); };

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

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;
        const destStatus = destination.droppableId;
        const orderId = draggableId;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: destStatus } : o));
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: destStatus }),
            });
        } catch (e) {
            fetchOrders();
        } finally {
            setIsDnDActive(false);
        }
    };

    const onDragStart = () => { setIsDnDActive(true); };

    if (!mounted) {
        return <div style={{ background: "#050810", minHeight: "100vh" }} />;
    }

    return (
        <div className="page-content" style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 100px)",
            overflow: "hidden",
            position: "relative",
            padding: "24px 24px 0 24px",
            minWidth: 0, // CRITICAL: Allow flex child to shrink
            maxWidth: "100%", // Don't exceed parent width
        }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Kontaktlar oqimi</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Sotuv voronkasi bo'ylab buyurtmalarni boshqaring</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        onClick={openCreate}
                        className="btn btn-primary"
                        style={{
                            background: "linear-gradient(135deg, #6366f1, #a855f7)",
                            padding: "10px 24px",
                            borderRadius: "12px",
                            fontWeight: 700
                        }}
                    >
                        <Plus size={20} /> Buyurtma yaratish
                    </button>
                </div>
            </div>

            {/* Kanban board — native scrollbar hidden */}
            <div
                ref={scrollContainerRef}
                style={{
                    display: "flex",
                    gap: 20,
                    overflowX: "auto",
                    width: "100%", // Explicitly set width to 100%
                    maxWidth: "100%", // Constrain to parent
                    flex: 1, // Take all remaining space
                    minHeight: 0, // Critical for nested flexing
                    scrollBehavior: "auto",
                    cursor: "grab",
                    userSelect: "none",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    paddingBottom: 24, // Space for the scrollbar overlay
                }}
                className="kanban-main-container hide-native-scrollbar"
            >


                {/* CSS to hide native scrollbar in Webkit browsers */}
                <style>{`
                    .hide-native-scrollbar::-webkit-scrollbar {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                    }
                `}</style>

                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    {COLUMNS.map(column => {
                        const columnOrders = orders
                            .filter(o => o.status === column.id)
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                        return (
                            <div key={column.id} className="card" style={{
                                flex: "0 0 320px",
                                display: "flex",
                                flexDirection: "column",
                                background: "rgba(255,255,255,0.02)",
                                borderRadius: "var(--radius-lg)",
                                height: "100%",
                                border: "1px solid var(--border)",
                            }}>

                                {/* Column Header */}
                                <div style={{
                                    padding: "20px",
                                    borderBottom: "1px solid var(--border)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "rgba(255,255,255,0.03)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: column.color, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "1px" }}>
                                        <div style={{ padding: 6, borderRadius: 8, background: `${column.color}20` }}>{column.icon}</div>
                                        {column.title}
                                    </div>
                                    <div style={{
                                        background: "rgba(255,255,255,0.05)",
                                        padding: "4px 10px",
                                        borderRadius: 20,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "var(--text-secondary)",
                                        border: "1px solid var(--border)"
                                    }}>
                                        {columnOrders.length}
                                    </div>
                                </div>

                                {/* Droppable Area */}
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="kanban-column-scroll"
                                            style={{
                                                padding: 16,
                                                flex: 1,
                                                overflowY: "auto",
                                                background: snapshot.isDraggingOver ? "rgba(99,102,241,0.03)" : "transparent",
                                                transition: "background 0.2s ease"
                                            }}
                                        >
                                            {columnOrders.map((order, index) => (
                                                <Draggable key={order.id} draggableId={order.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`card card-padded kanban-card ${isNewLead(order.createdAt) ? 'new-lead-glow' : ''}`}
                                                            onClick={() => { if (!snapshot.isDragging) setSelectedOrder(order); }}
                                                            style={{
                                                                userSelect: "none",
                                                                padding: 16,
                                                                margin: "0 0 12px 0",
                                                                background: "rgba(255,255,255,0.03)",
                                                                border: isNewLead(order.createdAt) ? "1px solid var(--accent-primary)" : "1px solid rgba(255,255,255,0.05)",
                                                                borderRadius: "var(--radius-lg)",
                                                                boxShadow: snapshot.isDragging ? "0 20px 50px rgba(0,0,0,0.5)" : "var(--shadow-sm)",
                                                                backdropFilter: "blur(10px)",
                                                                ...provided.draggableProps.style,
                                                                cursor: "pointer",
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", fontFamily: "monospace", letterSpacing: "0.5px" }}>#{order.orderNumber.slice(-6)}</span>
                                                                    {isNewLead(order.createdAt) && (
                                                                        <span className="badge-new">NEW</span>
                                                                    )}
                                                                </div>
                                                                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-success)" }}>{formatSum(order.totalSum)}</span>
                                                            </div>
                                                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: "var(--text-primary)", lineHeight: 1.4 }}>
                                                                {order.customer?.fullName}
                                                            </div>

                                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                                                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={12} style={{ margin: "auto" }} /></div>
                                                                    {order.customer?.phone}
                                                                </div>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={12} style={{ margin: "auto" }} /></div>
                                                                    {order.customer?.region}
                                                                </div>
                                                            </div>

                                                            {snapshot.isDragging && (
                                                                <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", border: "2px solid var(--accent-primary)", pointerEvents: "none" }} />
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                            </div>
                        );
                    })}
                </DragDropContext>
            </div>

            {/* ── AmoCRM-style Horizontal Scrollbar Overlay ── */}
            {canScroll && (
                <div style={{
                    position: "absolute",
                    bottom: 15,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "400px",
                    height: "14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    zIndex: 9999,
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    opacity: 1,
                    transition: "opacity 0.3s ease"
                }}>
                    <div
                        ref={trackRef}
                        onClick={handleTrackClick}
                        style={{ width: "100%", height: "100%", position: "relative", cursor: "pointer" }}
                    >
                        <div
                            onMouseDown={handleThumbMouseDown}
                            onClick={(e) => e.stopPropagation()} // Prevent track click when clicking thumb
                            style={{
                                position: "absolute",
                                left: `${thumbLeftPct}%`,
                                width: `${thumbWidthPct}%`,
                                height: "100%",
                                background: "#6366f1", // VIBRANT BLUE (Primary Accent)
                                borderRadius: "10px",
                                cursor: "grab",
                                transition: "background 0.2s, box-shadow 0.2s",
                                boxShadow: "0 0 10px rgba(99, 102, 241, 0.3)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#818cf8";
                                e.currentTarget.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.6)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#6366f1";
                                e.currentTarget.style.boxShadow = "0 0 10px rgba(99, 102, 241, 0.3)";
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            {selectedOrder && (
                <OrderDetailsModal
                    selectedOrder={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    updateStatus={updateStatus}
                />
            )}
            {showCreate && (
                <CreateOrderModal
                    onClose={() => setShowCreate(false)}
                    onSuccess={handleCreateSuccess}
                    customers={customers}
                    products={products}
                />
            )}
        </div>
    );
}
