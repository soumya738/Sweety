import { useEffect, useRef, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    ArrowLeft,
    BarChart2,
    KeyRound,
    LayoutDashboard,
    LogOut,
    UserRound,
    X,
} from "lucide-react";
import api from "../api/axios";
import "./Navbar.css";

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const accountRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordBusy, setPasswordBusy] = useState(false);

    useEffect(() => {
        if (!menuOpen) return;

        function handleOutsideClick(event) {
            if (accountRef.current && !accountRef.current.contains(event.target)) {
                setMenuOpen(false);
                setUpdatingPassword(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setUpdatingPassword(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;
        const selector = updatingPassword
            ? ".account-password-form input"
            : ".account-menu-actions button";
        menuRef.current?.querySelector(selector)?.focus();
    }, [menuOpen, updatingPassword]);

    async function handleLogout() {
        await logout();
        navigate("/auth", { replace: true });
    }

    function openPasswordForm() {
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordError("");
        setPasswordSuccess("");
        setUpdatingPassword(true);
    }

    function handlePasswordChange(event) {
        const { name, value } = event.target;
        setPasswords((current) => ({ ...current, [name]: value }));
        setPasswordError("");
        setPasswordSuccess("");
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        const { currentPassword, newPassword, confirmPassword } = passwords;
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }
        if (newPassword === currentPassword) {
            setPasswordError("Your new password must be different from your current password.");
            return;
        }

        setPasswordBusy(true);
        try {
            await api.put("/auth/password", { currentPassword, newPassword });
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordSuccess("Password updated successfully.");
        } catch (error) {
            setPasswordError(
                error?.response?.data?.error || "Failed to update password. Please try again."
            );
        } finally {
            setPasswordBusy(false);
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="navbar-brand-icon">🩸</span>
                <span className="navbar-brand-name">Sweety</span>
            </div>

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

            <div className="navbar-user" ref={accountRef}>
                <button
                    ref={triggerRef}
                    type="button"
                    className="navbar-avatar"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="Open account menu"
                    aria-haspopup="dialog"
                    aria-expanded={menuOpen}
                >
                    {getInitials(user?.name) || <UserRound size={20} />}
                </button>

                {menuOpen && (
                    <section
                        ref={menuRef}
                        className="account-menu"
                        role="dialog"
                        aria-label="Account menu"
                    >
                        <div className="account-menu-header">
                            <span className="account-menu-avatar" aria-hidden="true">
                                {getInitials(user?.name) || <UserRound size={20} />}
                            </span>
                            <div className="account-menu-identity">
                                <strong>{user?.name}</strong>
                                <span>{user?.email}</span>
                            </div>
                            <button
                                type="button"
                                className="account-menu-close"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setUpdatingPassword(false);
                                    triggerRef.current?.focus();
                                }}
                                aria-label="Close account menu"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {updatingPassword ? (
                            <div className="account-password-section">
                                <button
                                    type="button"
                                    className="account-back"
                                    onClick={() => setUpdatingPassword(false)}
                                >
                                    <ArrowLeft size={15} />
                                    Account
                                </button>
                                <h2>Update password</h2>
                                <form
                                    className="account-password-form"
                                    onSubmit={handlePasswordSubmit}
                                    noValidate
                                >
                                    <label>
                                        Current password
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            autoComplete="current-password"
                                            value={passwords.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        New password
                                        <input
                                            type="password"
                                            name="newPassword"
                                            autoComplete="new-password"
                                            value={passwords.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Confirm new password
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            autoComplete="new-password"
                                            value={passwords.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </label>
                                    {passwordError && (
                                        <p className="account-password-error" role="alert">
                                            {passwordError}
                                        </p>
                                    )}
                                    {passwordSuccess && (
                                        <p className="account-password-success" role="status">
                                            {passwordSuccess}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        className="account-password-submit"
                                        disabled={passwordBusy}
                                    >
                                        {passwordBusy ? "Updating…" : "Update password"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="account-menu-actions">
                                <button
                                    type="button"
                                    className="account-menu-action"
                                    onClick={openPasswordForm}
                                >
                                    <KeyRound size={17} />
                                    Update password
                                </button>
                                <button
                                    type="button"
                                    className="account-menu-action account-menu-logout"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </nav>
    );
}
