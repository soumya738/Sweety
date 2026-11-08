import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

export default function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    return user ? <Navigate to="/dashboard" replace /> : children;
}
