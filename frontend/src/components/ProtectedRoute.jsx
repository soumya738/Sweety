import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires the user to be logged in.
 * - While session is being checked  → shows nothing (avoids flash)
 * - Not logged in                   → redirects to /auth
 * - Logged in                       → renders the child route
 */
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? children : <Navigate to="/auth" replace />;
}
