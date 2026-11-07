import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, BarChart2, LayoutDashboard } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/auth", { replace: true });
    }

    return (
        <nav className="navbar">
            {/* Brand */}
            <div className="navbar-brand">
                <span className="navbar-brand-icon">🩸</span>
                <span className="navbar-brand-name">Sweety</span>
            </div>

            {/* Nav links */}
            <div className="navbar-links">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        "navbar-link" + (isActive ? " active" : "")
                    }
                >
                    <LayoutDashboard size={16} />
                    Dashboard
                </NavLink>
                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        "navbar-link" + (isActive ? " active" : "")
                    }
                >
                    <BarChart2 size={16} />
                    Reports
                </NavLink>
            </div>

            {/* User + logout */}
            <div className="navbar-user">
                <span className="navbar-username">Hi, {user?.name?.split(" ")[0]}</span>
                <button
                    className="navbar-logout"
                    onClick={handleLogout}
                    aria-label="Log out"
                    title="Log out"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}
