import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

function Field({ label, id, type = "text", value, onChange, autoComplete }) {
    return (
        <div className="auth-field">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                required
            />
        </div>
    );
}

export default function AuthPage() {
    const { login, register } = useAuth();

    const [mode, setMode]         = useState("login");
    const [name, setName]         = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [busy, setBusy]         = useState(false);

    const isLogin = mode === "login";

    function switchMode() {
        setMode(isLogin ? "register" : "login");
        setError("");
        setName("");
        setEmail("");
        setPassword("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!password) {
            setError("Please enter your password.");
            return;
        }
        if (!isLogin && name.trim().length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }

        setBusy(true);

        try {
            if (isLogin) {
                await login(email.trim(), password);
            } else {
                await register(name.trim(), email.trim(), password);
            }
        } catch (err) {
            setError(
                err?.response?.data?.error ||
                "Something went wrong. Please try again."
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <span className="auth-brand-icon">🩸</span>
                    <h1 className="auth-brand-name">Sweety</h1>
                    <p className="auth-brand-tagline">Blood Glucose Tracker</p>
                </div>

                <div className="auth-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={isLogin}
                        className={isLogin ? "active" : ""}
                        onClick={() => mode !== "login" && switchMode()}
                        type="button"
                    >
                        Log in
                    </button>
                    <button
                        role="tab"
                        aria-selected={!isLogin}
                        className={!isLogin ? "active" : ""}
                        onClick={() => mode !== "register" && switchMode()}
                        type="button"
                    >
                        Sign up
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {!isLogin && (
                        <Field
                            label="Name"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                        />
                    )}

                    <Field
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete={isLogin ? "username" : "email"}
                    />

                    <Field
                        label="Password"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                    />

                    {error && (
                        <p className="auth-error" role="alert">{error}</p>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={busy}
                    >
                        {busy
                            ? isLogin ? "Logging in…" : "Creating account…"
                            : isLogin ? "Log in"      : "Create account"}
                    </button>
                </form>

                <p className="auth-switch">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={switchMode}
                    >
                        {isLogin ? "Sign up" : "Log in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
