"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Users as UsersIcon, Settings, ShieldCheck } from "lucide-react";

export default function TeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [leaderId, setLeaderId] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/teams");
        if (res.ok) setTeams(await res.json());
        setLoading(false);
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await fetch("/api/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, leaderId: leaderId || null }),
        });
        if (res.ok) {
            setShowCreate(false);
            setName("");
            setDescription("");
            setLeaderId("");
            fetchTeams();
        }
        setSaving(false);
    };

    const openCreate = async () => {
        const res = await fetch("/api/users");
        if (res.ok) {
            const data = await res.json();
            setUsers(data || []);
        }
        setShowCreate(true);
    };

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>👥 Jamoalar</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Operatorlar jamoalarini boshqarish</p>
            </div>

            <div className="toolbar">
                <div className="toolbar-left" />
                <div className="toolbar-right">
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={14} /> Jamoa qo'shish
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-center"><div className="spinner" /></div>
                    ) : teams.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <p>Hozircha jamoalar yo'q</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Jamoa nomi</th>
                                    <th>Jamoa rahbari</th>
                                    <th>Tavsif</th>
                                    <th>A'zolar soni</th>
                                    <th>Yaratilgan</th>
                                    <th style={{ textAlign: "right" }}>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((t: any) => (
                                    <tr key={t.id}>
                                        <td>
                                            <div className="primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ padding: 6, borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "var(--accent-primary)" }}>
                                                    <UsersIcon size={14} />
                                                </div>
                                                {t.name}
                                            </div>
                                        </td>
                                        <td>
                                            {t.leader ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                                                    <ShieldCheck size={14} color="var(--accent-warning)" />
                                                    {t.leader.fullName}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>— Tayinlanmagan</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.description || "—"}</td>
                                        <td>
                                            <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-success)" }}>
                                                {t._count?.users || 0} ta operator
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString("uz-UZ")}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <button className="btn btn-secondary btn-icon"><Settings size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">➕ Yangi jamoa</h2>
                            <button className="btn btn-secondary btn-icon" onClick={() => setShowCreate(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Jamoa nomi *</label>
                                    <input required className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Masalan: Jamoa A" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Jamoa rahbari (ixtiyoriy)</label>
                                    <select className="form-control" value={leaderId} onChange={e => setLeaderId(e.target.value)}>
                                        <option value="">Tanlash...</option>
                                        {users.map((u: any) => (
                                            <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tavsif (ixtiyoriy)</label>
                                    <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Bekor</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Saqlanmoqda..." : "Yaratish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
