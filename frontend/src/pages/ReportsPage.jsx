import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import api from "../api/axios";
import "./ReportsPage.css";

// ── helpers ────────────────────────────────────────────────────────────────────

function toDateStr(d) {
    return d.toLocaleDateString("en-CA"); // "YYYY-MM-DD" local
}

function toMonthStr(d) {
    // "YYYY-MM"
    return d.toLocaleDateString("en-CA").slice(0, 7);
}

function formatDisplayDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function formatDisplayMonth(monthStr) {
    const [y, m] = monthStr.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
        month: "long", year: "numeric",
    });
}

function formatDateRange(from, to) {
    if (from === to) return formatDisplayDate(from);
    return `${formatDisplayDate(from)} – ${formatDisplayDate(to)}`;
}

const SLOT_COLORS = {
    BEFOREBREAKFAST: "slot-1",
    AFTERBREAKFAST:  "slot-2",
    AFTERLUNCH:      "slot-3",
    AFTERDINNER:     "slot-4",
};

// ── component ──────────────────────────────────────────────────────────────────

const TABS = [
    { key: "daily",   label: "Daily"         },
    { key: "mtd",     label: "Month-to-date" },
    { key: "monthly", label: "Monthly"       },
];

export default function ReportsPage() {
    const [activeTab,    setActiveTab]    = useState("daily");
    const [report,       setReport]       = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState("");

    // Daily / MTD use a date picker
    const [selectedDate,  setSelectedDate]  = useState(toDateStr(new Date()));
    // Monthly uses a month picker
    const [selectedMonth, setSelectedMonth] = useState(toMonthStr(new Date()));

    // ── Fetch report ─────────────────────────────────────────────────────────
    const fetchReport = useCallback(async (tab, date, month) => {
        setLoading(true);
        setError("");
        setReport(null);
        try {
            let url;
            if (tab === "monthly") {
                url = `/report?type=monthly&month=${month}`;
            } else {
                url = `/report?type=${tab}&date=${date}`;
            }
            const res = await api.get(url);
            setReport(res.data.data);
        } catch (err) {
            setError(
                err?.response?.data?.error || "Failed to load report. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Re-fetch whenever tab or date/month changes
    useEffect(() => {
        fetchReport(activeTab, selectedDate, selectedMonth);
    }, [activeTab, selectedDate, selectedMonth, fetchReport]);

    function handleTabChange(tab) {
        setActiveTab(tab);
        setReport(null);
        setError("");
    }

    const isEmpty = report && report.stats.count === 0;

    return (
        <div className="reports-layout">
            <Navbar />

            <main className="reports-main">
                <h1 className="reports-heading">Reports</h1>

                {/* ── Tab bar ── */}
                <div className="reports-tabs" role="tablist">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            role="tab"
                            aria-selected={activeTab === t.key}
                            className={"reports-tab" + (activeTab === t.key ? " active" : "")}
                            onClick={() => handleTabChange(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="reports-filter card">
                    {activeTab === "monthly" ? (
                        <label className="filter-label">
                            Month
                            <input
                                type="month"
                                value={selectedMonth}
                                max={toMonthStr(new Date())}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="filter-input"
                            />
                        </label>
                    ) : (
                        <label className="filter-label">
                            Date
                            <input
                                type="date"
                                value={selectedDate}
                                max={toDateStr(new Date())}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="filter-input"
                            />
                        </label>
                    )}

                    {/* Show resolved date range once loaded */}
                    {report && (
                        <p className="filter-range">
                            {formatDateRange(report.dateRange.from, report.dateRange.to)}
                        </p>
                    )}
                </div>

                {/* ── Loading ── */}
                {loading && (
                    <div className="reports-loading card">
                        Loading report…
                    </div>
                )}

                {/* ── Error ── */}
                {error && (
                    <div className="reports-error card" role="alert">
                        {error}
                    </div>
                )}

                {/* ── Report content ── */}
                {report && !loading && (
                    <>
                        {/* Stats */}
                        <section className="card">
                            <h2 className="section-title">Summary</h2>
                            {isEmpty ? (
                                <div className="reports-empty">
                                    <span className="reports-empty-icon">📊</span>
                                    <p>No readings for this period.</p>
                                    <p className="reports-empty-sub">
                                        Add readings from the Dashboard to see your stats here.
                                    </p>
                                </div>
                            ) : (
                                <StatsCard stats={report.stats} />
                            )}
                        </section>

                        {/* Daily reading list */}
                        {activeTab === "daily" && !isEmpty && (
                            <section className="card">
                                <h2 className="section-title">
                                    Readings
                                    <span className="readings-count-badge">
                                        {report.readings.length}
                                    </span>
                                </h2>
                                <ul className="report-readings-list">
                                    {report.readings.map((r) => (
                                        <li
                                            key={r.id}
                                            className={`report-reading-row ${SLOT_COLORS[r.slot] ?? ""}`}
                                        >
                                            <span className="rrr-dot" />
                                            <span className="rrr-slot">{r.slotDisplay}</span>
                                            <span className="rrr-value">
                                                {r.value}
                                                <span className="rrr-unit"> mg/dL</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
