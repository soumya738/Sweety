import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

/**
 * Provides { user, loading, login, register, logout } to the whole tree.
 *
 * `user`    – the logged-in user object { id, name, email } or null
 * `loading` – true while we're checking the session on first mount
 */
export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Check existing session on first load ───────────────────────────────
    // If the httpOnly cookie is still valid, /auth/me returns the user.
    // This keeps the user logged in across page refreshes.
    useEffect(() => {
        api.get("/auth/me")
            .then((res) => setUser(res.data.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    // ── Auth actions ───────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        setUser(res.data.data.user);
        return res.data.data.user;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const res = await api.post("/auth/register", { name, email, password });
        setUser(res.data.data.user);
        return res.data.data.user;
    }, []);

    const logout = useCallback(async () => {
        await api.post("/auth/logout");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Convenience hook — use this in any component instead of useContext directly. */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
