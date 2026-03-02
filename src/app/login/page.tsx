"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Email yoki parol noto'g'ri. Qayta urinib ko'ring.");
        } else {
            router.push("/dashboard");
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">🛒</div>
                    <h1 className="login-title">Maffmobile</h1>
                    <p className="login-subtitle">CRM Boshqaruv Tizimi</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Email manzil</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="email@kompaniya.uz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Parol</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ marginTop: 8 }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                Kirish...
                            </>
                        ) : (
                            "Tizimga kirish"
                        )}
                    </button>
                </form>


                <div style={{ marginTop: 24, textAlign: "center" }}>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Maffmobile CRM v1.0 © 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
