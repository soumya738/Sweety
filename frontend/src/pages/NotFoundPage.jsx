import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
    return (
        <div className="notfound-page">
            <span className="notfound-icon">🔍</span>
            <h1 className="notfound-code">404</h1>
            <p className="notfound-message">Page not found</p>
            <p className="notfound-sub">
                The page you're looking for doesn't exist.
            </p>
            <Link to="/dashboard" className="notfound-btn">
                Go to Dashboard
            </Link>
        </div>
    );
}
