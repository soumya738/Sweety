import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Navbar from "../components/Navbar";
import ReadingCard from "../components/ReadingCard";
import ReadingForm from "../components/ReadingForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
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
    const { user } = useAuth();
    const firstName = user?.name?.split(" ")[0] ?? "";
    const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
    const [readingsState, setReadingsState] = useState({ date: "", readings: [] });
    const [loadingData,  setLoadingData]  = useState(false);
    const [fetchError,   setFetchError]   = useState("");
    const [deleteError,  setDeleteError]  = useState("");
    const readingsRequestId = useRef(0);

    // Form state — null = hidden, "add" = add mode, { ...reading } = edit mode
    const [formMode,  setFormMode]  = useState(null);
    const [formBusy,  setFormBusy]  = useState(false);
    const [formError, setFormError] = useState("");

    // Delete confirmation dialog
    const [confirmDelete, setConfirmDelete] = useState(null); // null | { id, slotDisplay }
    const [deletingId,    setDeletingId]    = useState(null);

    // ── Fetch readings ─────────────────────────────────────────────────────
    const fetchReadings = useCallback(async (date) => {
        const requestId = ++readingsRequestId.current;
        setLoadingData(true);
        setFetchError("");
        setReadingsState({ date, readings: [] });
        try {
            const res = await api.get(`/readings?date=${date}`);
            if (requestId === readingsRequestId.current) {
                setReadingsState({ date, readings: res.data.data.readings });
            }
        } catch {
            if (requestId === readingsRequestId.current) {
                setFetchError("Failed to load readings. Please refresh.");
            }
        } finally {
            if (requestId === readingsRequestId.current) setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchReadings(selectedDate);
        setFormMode(null);
        setFormError("");
    }, [selectedDate, fetchReadings]);

    // ── Date navigation ────────────────────────────────────────────────────
    function shiftDate(days) {
        const [y, m, d] = selectedDate.split("-").map(Number);
        const next = new Date(y, m - 1, d + days);
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
            setReadingsState((current) => {
                if (current.date !== selectedDate) return current;
                const prev = current.readings;
                const next = [...prev, res.data.data.reading];
                const ORDER = {
                    BEFOREBREAKFAST: 1, AFTERBREAKFAST: 2,
                    AFTERLUNCH: 3,      AFTERDINNER: 4,
                };
                return {
                    ...current,
                    readings: next.sort((a, b) => ORDER[a.slot] - ORDER[b.slot]),
                };
            });
            setFormMode(null);
        } catch (err) {
            setFormError(err?.response?.data?.error || "Failed to add reading.");
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
            setReadingsState((current) => ({
                ...current,
                readings: current.readings.map((r) =>
                    r.id === formMode.id ? res.data.data.reading : r
                ),
            }));
            setFormMode(null);
        } catch (err) {
            setFormError(err?.response?.data?.error || "Failed to update reading.");
        } finally {
            setFormBusy(false);
        }
    }

    // ── Delete reading — open dialog ───────────────────────────────────────
    function requestDelete(reading) {
        setConfirmDelete({ id: reading.id, slotDisplay: reading.slotDisplay });
    }

    async function confirmDeleteReading() {
        const id = confirmDelete.id;
        setConfirmDelete(null);
        setDeletingId(id);
        setDeleteError("");
        try {
            await api.delete(`/readings/${id}`);
            setReadingsState((current) => ({
                ...current,
                readings: current.readings.filter((r) => r.id !== id),
            }));
            if (formMode?.id === id) setFormMode(null);
        } catch (error) {
            setDeleteError(
                error?.response?.data?.error || "Failed to delete reading. Please try again."
            );
        } finally {
            setDeletingId(null);
        }
    }

    const readings = readingsState.date === selectedDate ? readingsState.readings : [];
    const takenSlots = readings.map((r) => r.slot);
    const canAddMore = readings.length < 4;
    const isFuture   = selectedDate > toDateStr(new Date());

    return (
        <div className="dashboard-layout">
            <Navbar />

            {/* ── Delete confirmation dialog ── */}
            <ConfirmDialog
                isOpen={Boolean(confirmDelete)}
                title="Delete reading?"
                message={
                    confirmDelete
                        ? `This will permanently remove your ${confirmDelete.slotDisplay} reading for ${selectedDate}.`
                        : ""
                }
                confirmLabel="Delete"
                cancelLabel="Keep it"
                variant="danger"
                onConfirm={confirmDeleteReading}
                onCancel={() => setConfirmDelete(null)}
            />

            <main className="dashboard-main">
                {/* ── Greeting banner ── */}
                <section className="greeting-banner">
                    <div className="greeting-text">
                        <h1 className="greeting-heading">
                            Welcome, {firstName}! 👋
                        </h1>
                        <p className="greeting-sub">
                            Hope you're doing well today. Below you can see your blood glucose readings and keep your health on track.
                        </p>
                    </div>
                    <span className="greeting-emoji" aria-hidden="true">🩸</span>
                </section>

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
                            <button className="date-nav-today" onClick={goToday} type="button">
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
                            <span className="readings-count">{readings.length}/4</span>
                        </h2>

                        {canAddMore && !isFuture && formMode !== "add" && (
                            <button
                                className="btn-add"
                                onClick={() => { setFormMode("add"); setFormError(""); }}
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        )}
                    </div>

                    {deleteError && (
                        <p className="readings-error" role="alert">{deleteError}</p>
                    )}

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

                    {loadingData && <p className="readings-placeholder">Loading…</p>}
                    {fetchError  && <p className="readings-error" role="alert">{fetchError}</p>}

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

                    <ul className="readings-list" aria-label="Readings">
                        {readings.map((r) => (
                            <li key={r.id}>
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
                                        onEdit={() => { setFormMode(r); setFormError(""); }}
                                        onDelete={() => requestDelete(r)}
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
