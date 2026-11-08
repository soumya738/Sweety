import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import "./DatePicker.css";

const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function toDateStr(d) {
    return d.toLocaleDateString("en-CA");
}

function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year, month) {
    return new Date(year, month, 1).getDay();
}

export default function DatePicker({ value, max, onChange, label }) {
    const [open, setOpen] = useState(false);
    const ref             = useRef(null);

    const [viewYear,  setViewYear]  = useState(() => {
        const d = value ? new Date(value + "T00:00:00") : new Date();
        return d.getFullYear();
    });
    const [viewMonth, setViewMonth] = useState(() => {
        const d = value ? new Date(value + "T00:00:00") : new Date();
        return d.getMonth();
    });

    const selDate = value ? new Date(value + "T00:00:00") : null;
    const maxDate = max   ? new Date(max   + "T00:00:00") : null;

    useEffect(() => {
        if (!open) return;
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function handler(e) { if (e.key === "Escape") setOpen(false); }
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open]);

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    function selectDay(day) {
        const d = new Date(viewYear, viewMonth, day);
        if (maxDate && d > maxDate) return; // blocked
        onChange(toDateStr(d));
        setOpen(false);
    }

    function formatTrigger() {
        if (!selDate) return "Pick a date";
        return selDate.toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
        });
    }

    const totalDays  = daysInMonth(viewYear, viewMonth);
    const startDay   = firstWeekday(viewYear, viewMonth);
    const todayStr   = toDateStr(new Date());

    return (
        <div className="dp-wrapper" ref={ref}>
            {label && <span className="dp-label">{label}</span>}

            <button
                type="button"
                className="dp-trigger"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={open}
            >
                <CalendarDays size={15} className="dp-icon" />
                {formatTrigger()}
            </button>

            {open && (
                <div className="dp-popover" role="dialog" aria-label="Date picker">
                    <div className="dp-header">
                        <button
                            type="button"
                            className="dp-nav-btn"
                            onClick={prevMonth}
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="dp-month-label">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            className="dp-nav-btn"
                            onClick={nextMonth}
                            aria-label="Next month"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="dp-grid">
                        {DAYS.map(d => (
                            <span key={d} className="dp-dow">{d}</span>
                        ))}

                        {Array.from({ length: startDay }).map((_, i) => (
                            <span key={`e-${i}`} />
                        ))}

                        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                            const d        = new Date(viewYear, viewMonth, day);
                            const dStr     = toDateStr(d);
                            const isToday  = dStr === todayStr;
                            const isSel    = dStr === value;
                            const isBlocked = maxDate && d > maxDate;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={[
                                        "dp-day",
                                        isToday   ? "today"    : "",
                                        isSel     ? "selected" : "",
                                        isBlocked ? "blocked"  : "",
                                    ].join(" ")}
                                    onClick={() => selectDay(day)}
                                    disabled={isBlocked}
                                    aria-label={dStr}
                                    aria-pressed={isSel}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {value !== todayStr && (
                        <button
                            type="button"
                            className="dp-today-btn"
                            onClick={() => {
                                const now = new Date();
                                setViewYear(now.getFullYear());
                                setViewMonth(now.getMonth());
                                onChange(todayStr);
                                setOpen(false);
                            }}
                        >
                            Today
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
