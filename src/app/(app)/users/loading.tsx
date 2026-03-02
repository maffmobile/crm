export default function Loading() {
    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 110, height: 16, borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 260, height: 36, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 140, height: 36, borderRadius: 8, marginLeft: "auto" }} />
            </div>
            <div className="card">
                <div style={{ display: "flex", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    {[140, 160, 100, 90, 70, 60].map((w, i) => (
                        <div key={i} className="skeleton" style={{ width: w, height: 12, borderRadius: 4 }} />
                    ))}
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                            <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 4 }} />
                        </div>
                        <div className="skeleton" style={{ width: 150, height: 14, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: 90, height: 22, borderRadius: 20 }} />
                        <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 20 }} />
                        <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: 55, height: 28, borderRadius: 8 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
