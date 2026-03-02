export default function Loading() {
    return (
        <div className="page-content">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <div className="skeleton" style={{ width: 220, height: 28, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 160, height: 16, borderRadius: 6 }} />
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="stat-card" style={{ padding: 24 }}>
                        <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4, marginBottom: 14 }} />
                        <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 6, marginBottom: 10 }} />
                        <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, position: "absolute", top: 20, right: 20 }} />
                    </div>
                ))}
            </div>

            {/* Chart placeholder */}
            <div className="card" style={{ padding: 24 }}>
                <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 6, marginBottom: 20 }} />
                <div className="skeleton" style={{ width: "100%", height: 220, borderRadius: 10 }} />
            </div>
        </div>
    );
}
