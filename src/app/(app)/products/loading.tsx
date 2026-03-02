export default function Loading() {
    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton" style={{ width: 190, height: 28, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 110, height: 16, borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 260, height: 36, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 130, height: 36, borderRadius: 8, marginLeft: "auto" }} />
            </div>
            <div className="card">
                <div style={{ display: "flex", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    {[50, 200, 100, 80, 70, 60].map((w, i) => (
                        <div key={i} className="skeleton" style={{ width: w, height: 12, borderRadius: 4 }} />
                    ))}
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                        <div className="skeleton" style={{ width: 50, height: 50, borderRadius: 10 }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                            <div className="skeleton" style={{ width: 160, height: 14, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4 }} />
                        </div>
                        <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 20 }} />
                        <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 8 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
