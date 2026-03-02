export default function Loading() {
    return (
        <div className="page-content">
            <div style={{ marginBottom: 24 }}>
                <div className="skeleton" style={{ width: 180, height: 28, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 6 }} />
            </div>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="stat-card" style={{ padding: 24, position: "relative" }}>
                        <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4, marginBottom: 14 }} />
                        <div className="skeleton" style={{ width: 90, height: 32, borderRadius: 6 }} />
                        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, position: "absolute", top: 20, right: 20 }} />
                    </div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card" style={{ padding: 24 }}>
                    <div className="skeleton" style={{ width: 150, height: 18, borderRadius: 6, marginBottom: 20 }} />
                    <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: 10 }} />
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div className="skeleton" style={{ width: 150, height: 18, borderRadius: 6, marginBottom: 20 }} />
                    <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: 10 }} />
                </div>
            </div>
        </div>
    );
}
