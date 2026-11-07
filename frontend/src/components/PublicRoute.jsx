import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

/**
 * Wraps public-only routes (login/register).
 * - While session is being checked  → shows spinner
 * - Already logged in               → redirects to /dashboard
 * - Not logged in                   → renders the child (auth page)
 */
export default function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    return user ? <Navigate to="/dashboard" replace /> : children;
}
