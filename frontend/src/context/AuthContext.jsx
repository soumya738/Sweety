import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const CACHE_KEY = "sweety_user";

function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? null; }
    catch { return null; }
}

function writeCache(u) {
    if (u) localStorage.setItem(CACHE_KEY, JSON.stringify({ id: u.id, name: u.name, email: u.email }));
    else   localStorage.removeItem(CACHE_KEY);
}

export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(() => readCache());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/auth/me")
            .then((res) => {
                const u = res.data.data.user;
                writeCache(u);
                setUser(u);
            })
            .catch(() => {
                writeCache(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        const u = res.data.data.user;
        writeCache(u);   // write cache BEFORE setUser so next render reads it
        setUser(u);
        return u;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const res = await api.post("/auth/register", { name, email, password });
        const u = res.data.data.user;
        writeCache(u);
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(async () => {
        await api.post("/auth/logout");
        writeCache(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
