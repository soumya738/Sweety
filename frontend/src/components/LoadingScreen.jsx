import "./LoadingScreen.css";

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
