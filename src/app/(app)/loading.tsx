export default function Loading() {
    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton" style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 140, height: 16, borderRadius: 6 }} />
            </div>
            <div className="toolbar" style={{ marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 260, height: 36, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 120, height: 36, borderRadius: 8, marginLeft: "auto" }} />
            </div>
            <div className="card">
                <div style={{ padding: "16px 0" }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ display: "flex", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border-color)" }}>
                            <div className="skeleton" style={{ width: 80, height: 16, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: 140, height: 16, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: 100, height: 16, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: 90, height: 16, borderRadius: 4, marginLeft: "auto" }} />
                            <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 20 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
