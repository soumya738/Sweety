import "./StatsCard.css";

export default function StatsCard({ stats }) {
    const isEmpty = !stats || stats.count === 0;

    function fmt(val) {
        return val === null || val === undefined ? "—" : val;
    }

    return (
        <div className="stats-grid">
            <div className="stat-item">
                <span className="stat-label">Readings</span>
                <span className="stat-value">{isEmpty ? "—" : stats.count}</span>
            </div>
            <div className="stat-item highlight-high">
                <span className="stat-label">Highest</span>
                <span className="stat-value">
                    {fmt(stats?.highest)}
                    {!isEmpty && <span className="stat-unit"> mg/dL</span>}
                </span>
            </div>
            <div className="stat-item highlight-low">
                <span className="stat-label">Lowest</span>
                <span className="stat-value">
                    {fmt(stats?.lowest)}
                    {!isEmpty && <span className="stat-unit"> mg/dL</span>}
                </span>
            </div>
            <div className="stat-item highlight-avg">
                <span className="stat-label">Average</span>
                <span className="stat-value">
                    {fmt(stats?.average)}
                    {!isEmpty && <span className="stat-unit"> mg/dL</span>}
                </span>
            </div>
        </div>
    );
}
