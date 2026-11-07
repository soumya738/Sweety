import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Navbar from "../components/Navbar";
import ReadingCard from "../components/ReadingCard";
import ReadingForm from "../components/ReadingForm";
import api from "../api/axios";
import "./DashboardPage.css";

/* ── helpers ─────────────────────────────────────────────────────────────────── */
function toDateStr(date) {
    return date.toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time
}

function formatDisplayDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
}

function isToday(dateStr) {
    return dateStr === toDateStr(new Date());
}

/* ── component ────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
    const [readings,     setReadings]     = useState([]);
    const [loadingData,  setLoadingData]  = useState(false);
    const [fetchError,   setFetchError]   = useState("");

    // Form state — null = hidden, "add" = add mode, { ...reading } = edit mode
    const [formMode,  setFormMode]  = useState(null);
    const [formBusy,  setFormBusy]  = useState(false);
    const [formError, setFormError] = useState("");

    // Which reading id is currently being deleted
    const [deletingId, setDeletingId] = useState(null);

    // ── Fetch readings for the selected date ───────────────────────────────
    const fetchReadings = useCallback(async (date) => {
        setLoadingData(true);
        setFetchError("");
        try {
            const res = await api.get(`/readings?date=${date}`);
            setReadings(res.data.data.readings);
        } catch {
            setFetchError("Failed to load readings. Please refresh.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchReadings(selectedDate);
        // Close any open form when date changes
        setFormMode(null);
        setFormError("");
    }, [selectedDate, fetchReadings]);

    // ── Date navigation ────────────────────────────────────────────────────
    function shiftDate(days) {
        const [y, m, d] = selectedDate.split("-").map(Number);
        const next = new Date(y, m - 1, d + days);
        // Don't allow navigating into the future
        if (next > new Date()) return;
        setSelectedDate(toDateStr(next));
    }

    function goToday() { setSelectedDate(toDateStr(new Date())); }

    // ── Add reading ────────────────────────────────────────────────────────
    async function handleAdd(data) {
        setFormBusy(true);
        setFormError("");
        try {
            const res = await api.post("/readings", data);
            setReadings((prev) => {
                const next = [...prev, res.data.data.reading];
                // Keep meal order
                const ORDER = {
                    BEFOREBREAKFAST: 1, AFTERBREAKFAST: 2,
                    AFTERLUNCH: 3,      AFTERDINNER: 4,
                };
                return next.sort((a, b) => ORDER[a.slot] - ORDER[b.slot]);
            });
            setFormMode(null);
        } catch (err) {
            setFormError(
                err?.response?.data?.error || "Failed to add reading."
            );
        } finally {
            setFormBusy(false);
        }
    }

    // ── Edit reading ───────────────────────────────────────────────────────
    async function handleEdit(data) {
        setFormBusy(true);
        setFormError("");
        try {
            const res = await api.put(`/readings/${formMode.id}`, { value: data.value });
            setReadings((prev) =>
                prev.map((r) =>
                    r.id === formMode.id ? res.data.data.reading : r
                )
            );
            setFormMode(null);
        } catch (err) {
            setFormError(
                err?.response?.data?.error || "Failed to update reading."
            );
        } finally {
            setFormBusy(false);
        }
    }

    // ── Delete reading ─────────────────────────────────────────────────────
    async function handleDelete(id) {
        if (!window.confirm("Delete this reading?")) return;
        setDeletingId(id);
        try {
            await api.delete(`/readings/${id}`);
            setReadings((prev) => prev.filter((r) => r.id !== id));
            // If we were editing the deleted reading, close the form
            if (formMode?.id === id) setFormMode(null);
        } catch {
            alert("Failed to delete reading. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    const takenSlots  = readings.map((r) => r.slot);
    const canAddMore  = readings.length < 4;
    const isFuture    = selectedDate > toDateStr(new Date());

    return (
        <div className="dashboard-layout">
            <Navbar />

            <main className="dashboard-main">
                {/* ── Date navigator ── */}
                <section className="date-nav card">
                    <button
                        className="date-nav-btn"
                        onClick={() => shiftDate(-1)}
                        aria-label="Previous day"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="date-nav-center">
                        <span className="date-nav-label">
                            {formatDisplayDate(selectedDate)}
                        </span>
                        {!isToday(selectedDate) && (
                            <button
                                className="date-nav-today"
                                onClick={goToday}
                                type="button"
                            >
                                Today
                            </button>
                        )}
                    </div>

                    <button
                        className="date-nav-btn"
                        onClick={() => shiftDate(1)}
                        disabled={isToday(selectedDate)}
                        aria-label="Next day"
                    >
                        <ChevronRight size={18} />
                    </button>
                </section>

                {/* ── Readings list ── */}
                <section className="readings-section card">
                    <div className="readings-header">
                        <h2 className="readings-title">
                            Readings
                            <span className="readings-count">
                                {readings.length}/4
                            </span>
                        </h2>

                        {canAddMore && !isFuture && formMode !== "add" && (
                            <button
                                className="btn-add"
                                onClick={() => {
                                    setFormMode("add");
                                    setFormError("");
                                }}
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        )}
                    </div>

                    {/* Add form */}
                    {formMode === "add" && (
                        <div className="form-panel">
                            <button
                                className="form-panel-close"
                                onClick={() => setFormMode(null)}
                                aria-label="Close form"
                            >
                                <X size={16} />
                            </button>
                            <ReadingForm
                                date={selectedDate}
                                takenSlots={takenSlots}
                                onSubmit={handleAdd}
                                onCancel={() => setFormMode(null)}
                                busy={formBusy}
                                error={formError}
                            />
                        </div>
                    )}

                    {/* Loading */}
                    {loadingData && (
                        <p className="readings-placeholder">Loading…</p>
                    )}

                    {/* Fetch error */}
                    {fetchError && (
                        <p className="readings-error" role="alert">{fetchError}</p>
                    )}

                    {/* Empty state */}
                    {!loadingData && !fetchError && readings.length === 0 && (
                        <div className="readings-empty">
                            <span className="readings-empty-icon">📋</span>
                            <p>No readings for this day.</p>
                            {!isFuture && (
                                <p className="readings-empty-sub">
                                    Tap "Add" to log your first reading.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Reading cards */}
                    <ul className="readings-list" aria-label="Readings">
                        {readings.map((r) => (
                            <li key={r.id}>
                                {/* Edit form inline under the card */}
                                {formMode?.id === r.id ? (
                                    <div className="form-panel">
                                        <button
                                            className="form-panel-close"
                                            onClick={() => setFormMode(null)}
                                            aria-label="Close form"
                                        >
                                            <X size={16} />
                                        </button>
                                        <ReadingForm
                                            date={selectedDate}
                                            initial={{ value: r.value, slot: r.slot }}
                                            onSubmit={handleEdit}
                                            onCancel={() => setFormMode(null)}
                                            busy={formBusy}
                                            error={formError}
                                        />
                                    </div>
                                ) : (
                                    <ReadingCard
                                        reading={r}
                                        onEdit={() => {
                                            setFormMode(r);
                                            setFormError("");
                                        }}
                                        onDelete={() => handleDelete(r.id)}
                                        deleting={deletingId === r.id}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}
