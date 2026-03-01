"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, UserCheck, UserX, Users as UsersIcon, Building2, ShieldCheck, Settings, RefreshCw } from "lucide-react";

const ROLES = [
    { value: "ADMIN", label: "Administrator" },
    { value: "OPERATOR", label: "Savdo operatori" },
    { value: "POCHTA", label: "Pochta bo'limi" },
    { value: "OMBOR", label: "Omborchi" },
];

const ROLE_BADGE: Record<string, string> = {
    ADMIN: "badge badge-admin", OPERATOR: "badge badge-operator",
    POCHTA: "badge badge-pochta-role", OMBOR: "badge badge-ombor-role",
};

const emptyUserForm = { fullName: "", email: "", phone: "", password: "", role: "OPERATOR", teamId: "" };
const emptyTeamForm = { name: "", description: "", leaderId: "" };

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString("uz-UZ") : "—"; }

export default function UsersAndTeamsPage() {
    const [activeTab, setActiveTab] = useState<"users" | "teams">("users");
    const [users, setUsers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [userForm, setUserForm] = useState(emptyUserForm);
    const [teamForm, setTeamForm] = useState(emptyTeamForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [uRes, tRes] = await Promise.all([
                fetch("/api/users"),
                fetch("/api/teams")
            ]);
            if (uRes.ok) setUsers(await uRes.json());
            if (tRes.ok) setTeams(await tRes.json());
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError("");
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userForm),
        });
        if (res.ok) { setShowCreateUser(false); setUserForm(emptyUserForm); fetchAll(); }
        else {
            const data = await res.json();
            setError(data.error || "Xatolik yuz berdi");
        }
        setSaving(false);
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError("");
        const res = await fetch("/api/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...teamForm, leaderId: teamForm.leaderId || null }),
        });
        if (res.ok) { setShowCreateTeam(false); setTeamForm(emptyTeamForm); fetchAll(); }
        else {
            const data = await res.json();
            setError(data.error || "Xatolik yuz berdi");
        }
        setSaving(false);
    };

    return (
        <div className="page-content">
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>👤 Xodimlar va Jamoalar</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Tizim foydalanuvchilari va operatorlar jamoalarini boshqarish</p>
            </div>

            <div className="tab-header" style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid var(--border-color)", paddingBottom: 1 }}>
                <button
                    className={`tab-item ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                    style={{
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        color: activeTab === "users" ? "var(--accent-primary)" : "var(--text-muted)",
                        fontWeight: activeTab === "users" ? 600 : 400,
                        borderBottom: activeTab === "users" ? "3px solid var(--accent-primary)" : "3px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    Foydalanuvchilar
                </button>
                <button
                    className={`tab-item ${activeTab === "teams" ? "active" : ""}`}
                    onClick={() => setActiveTab("teams")}
                    style={{
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        color: activeTab === "teams" ? "var(--accent-primary)" : "var(--text-muted)",
                        fontWeight: activeTab === "teams" ? 600 : 400,
                        borderBottom: activeTab === "teams" ? "3px solid var(--accent-primary)" : "3px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    Jamoalar
                </button>
            </div>

            <div className="toolbar">
                <div className="toolbar-left">
                    <button className="btn btn-secondary btn-icon" onClick={fetchAll}><RefreshCw size={14} /></button>
                </div>
                <div className="toolbar-right">
                    {activeTab === "users" ? (
                        <button className="btn btn-primary" onClick={() => setShowCreateUser(true)}><Plus size={14} /> Foydalanuvchi qo'shish</button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setShowCreateTeam(true)}><Plus size={14} /> Jamoa qo'shish</button>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    {loading ? <div className="loading-center"><div className="spinner" /></div>
                        : activeTab === "users" ? (
                            users.length === 0 ? <div className="empty-state"><div className="empty-state-icon">👤</div><p>Foydalanuvchilar yo'q</p></div>
                                : (
                                    <table>
                                        <thead><tr><th>FIO</th><th>Email</th><th>Telefon</th><th>Jamoa</th><th>Rol</th><th>Holat</th><th>Yaratilgan</th></tr></thead>
                                        <tbody>
                                            {users.map((u: any) => (
                                                <tr key={u.id}>
                                                    <td><span className="primary">{u.fullName}</span></td>
                                                    <td style={{ fontSize: 13 }}>{u.email}</td>
                                                    <td style={{ fontSize: 12, fontFamily: "monospace" }}>{u.phone || "—"}</td>
                                                    <td style={{ fontSize: 13 }}>
                                                        {u.team?.name ? <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{u.team.name}</span> : <span style={{ color: "var(--text-muted)" }}>Yo'q</span>}
                                                    </td>
                                                    <td><span className={ROLE_BADGE[u.role] || "badge"}>{ROLES.find(r => r.value === u.role)?.label || u.role}</span></td>
                                                    <td>
                                                        {u.isActive
                                                            ? <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent-success)" }}><UserCheck size={14} /> Faol</span>
                                                            : <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}><UserX size={14} /> Nofaol</span>
                                                        }
                                                    </td>
                                                    <td style={{ fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                        ) : (
                            teams.length === 0 ? <div className="empty-state"><div className="empty-state-icon">👥</div><p>Hozircha jamoalar yo'q</p></div>
                                : (
                                    <table>
                                        <thead>
                                            <tr><th>Jamoa nomi</th><th>Rahbar</th><th>Tavsif</th><th>A'zolar</th><th>Yaratilgan</th><th style={{ textAlign: "right" }}>Amallar</th></tr>
                                        </thead>
                                        <tbody>
                                            {teams.map((t: any) => (
                                                <tr key={t.id}>
                                                    <td>
                                                        <div className="primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <div style={{ padding: 6, borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "var(--accent-primary)" }}><Building2 size={14} /></div>
                                                            {t.name}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {t.leader ? (
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                                                                <ShieldCheck size={14} color="var(--accent-warning)" />
                                                                {t.leader.fullName}
                                                            </div>
                                                        ) : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>}
                                                    </td>
                                                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.description || "—"}</td>
                                                    <td>
                                                        <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-success)" }}>
                                                            {t._count?.users || 0} ta operator
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: 12 }}>{formatDate(t.createdAt)}</td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <button className="btn btn-secondary btn-icon"><Settings size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                        )}
                </div>
            </div>

            {/* CREATE USER MODAL */}
            {showCreateUser && (
                <div className="modal-overlay" onClick={() => setShowCreateUser(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">➕ Yangi foydalanuvchi</h2>
                            <button className="btn btn-secondary btn-icon" onClick={() => setShowCreateUser(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="modal-body">
                                {error && activeTab === "users" && <div className="alert alert-error">{error}</div>}
                                <div className="form-grid">
                                    <div className="form-group form-col-full">
                                        <label className="form-label">To'liq ism *</label>
                                        <input required className="form-control" value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email *</label>
                                        <input required type="email" className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Telefon</label>
                                        <input className="form-control" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} placeholder="+998..." />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Parol *</label>
                                        <input required type="password" className="form-control" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="Kamida 6 ta belgi" minLength={6} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Rol *</label>
                                        <select required className="form-control" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Jamoa</label>
                                        <select className="form-control" value={userForm.teamId} onChange={e => setUserForm({ ...userForm, teamId: e.target.value })}>
                                            <option value="">Jamoasiz</option>
                                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateUser(false)}>Bekor</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saqlanmoqda..." : "Qo'shish"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE TEAM MODAL */}
            {showCreateTeam && (
                <div className="modal-overlay" onClick={() => setShowCreateTeam(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">➕ Yangi jamoa</h2>
                            <button className="btn btn-secondary btn-icon" onClick={() => setShowCreateTeam(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreateTeam}>
                            <div className="modal-body">
                                {error && activeTab === "teams" && <div className="alert alert-error">{error}</div>}
                                <div className="form-group">
                                    <label className="form-label">Jamoa nomi *</label>
                                    <input required className="form-control" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Masalan: Jamoa A" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Jamoa rahbari</label>
                                    <select className="form-control" value={teamForm.leaderId} onChange={e => setTeamForm({ ...teamForm, leaderId: e.target.value })}>
                                        <option value="">Tanlash...</option>
                                        {users.map((u: any) => (
                                            <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tavsif</label>
                                    <textarea className="form-control" value={teamForm.description} onChange={e => setTeamForm({ ...teamForm, description: e.target.value })} rows={3} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeam(false)}>Bekor</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saqlanmoqda..." : "Yaratish"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
