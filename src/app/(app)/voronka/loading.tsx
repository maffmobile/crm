export default function Loading() {
    return (
        <div className="page-content" style={{ overflow: "hidden" }}>
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton" style={{ width: 160, height: 28, borderRadius: 8, marginBottom: 8 }} />
            </div>
            {/* Kanban columns skeleton */}
            <div style={{ display: "flex", gap: 16, overflowX: "hidden" }}>
                {Array.from({ length: 6 }).map((_, col) => (
                    <div key={col} style={{ minWidth: 260, background: "var(--bg-secondary)", borderRadius: 14, padding: 16, border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                            <div className="skeleton" style={{ width: 110, height: 16, borderRadius: 6 }} />
                            <div className="skeleton" style={{ width: 28, height: 22, borderRadius: 12 }} />
                        </div>
                        {Array.from({ length: 3 + (col % 2) }).map((_, i) => (
                            <div key={i} className="card" style={{ padding: 14, marginBottom: 10 }}>
                                <div className="skeleton" style={{ width: "70%", height: 13, borderRadius: 4, marginBottom: 8 }} />
                                <div className="skeleton" style={{ width: "50%", height: 11, borderRadius: 4, marginBottom: 8 }} />
                                <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 14 }} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
