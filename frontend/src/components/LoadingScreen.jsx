import "./LoadingScreen.css";

/**
 * Full-page loading screen shown while the app checks the existing session.
 * Prevents the user seeing a flash of the login page before the cookie is verified.
 */
export default function LoadingScreen() {
    return (
        <div className="loading-screen" aria-label="Loading" role="status">
            <div className="loading-brand">
                <span className="loading-icon">🩸</span>
                <span className="loading-name">Sweety</span>
            </div>
            <div className="loading-spinner" aria-hidden="true" />
        </div>
    );
}
