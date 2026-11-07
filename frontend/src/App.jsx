import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
