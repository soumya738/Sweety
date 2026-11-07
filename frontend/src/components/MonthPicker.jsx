import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import "./DatePicker.css"; // shares the same stylesheet

const MONTHS_SHORT = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
];

/**
 * Themed month picker — shows a 3×4 month grid.
 *
 * Props:
 *   value    – "YYYY-MM" string
 *   max      – "YYYY-MM" string (optional, blocks future months)
 *   onChange – called with "YYYY-MM"
 *   label    – visible label above the trigger
 */
export default function MonthPicker({ value, max, onChange, label }) {
    const [open, setOpen] = useState(false);
    const ref             = useRef(null);

    const [viewYear, setViewYear] = useState(() =>
        value ? Number(value.split("-")[0]) : new Date().getFullYear()
    );

    // Parse max
    const [maxY, maxM] = max
        ? max.split("-").map(Number)
        : [9999, 11];

    // Close on outside click
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

    function selectMonth(monthIndex) {
        const str = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`;
        onChange(str);
        setOpen(false);
    }

    function isBlocked(monthIndex) {
        if (viewYear > maxY) return true;
        if (viewYear === maxY && monthIndex > maxM - 1) return true;
        return false;
    }

    function formatTrigger() {
        if (!value) return "Pick a month";
        const [y, m] = value.split("-").map(Number);
        return new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
            month: "long", year: "numeric",
        });
    }

    const selYear  = value ? Number(value.split("-")[0])     : null;
    const selMonth = value ? Number(value.split("-")[1]) - 1 : null;
    const nowY     = new Date().getFullYear();
    const nowM     = new Date().getMonth();

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
                <div className="dp-popover dp-month-popover" role="dialog" aria-label="Month picker">
                    {/* Year navigation */}
                    <div className="dp-header">
                        <button
                            type="button"
                            className="dp-nav-btn"
                            onClick={() => setViewYear(y => y - 1)}
                            aria-label="Previous year"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="dp-month-label">{viewYear}</span>
                        <button
                            type="button"
                            className="dp-nav-btn"
                            onClick={() => setViewYear(y => y + 1)}
                            disabled={viewYear >= maxY}
                            aria-label="Next year"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Month grid */}
                    <div className="dp-month-grid">
                        {MONTHS_SHORT.map((name, i) => {
                            const blocked  = isBlocked(i);
                            const isSel    = selYear === viewYear && selMonth === i;
                            const isNow    = nowY    === viewYear && nowM    === i;

                            return (
                                <button
                                    key={name}
                                    type="button"
                                    className={[
                                        "dp-month-cell",
                                        isNow    ? "today"    : "",
                                        isSel    ? "selected" : "",
                                        blocked  ? "blocked"  : "",
                                    ].join(" ")}
                                    onClick={() => !blocked && selectMonth(i)}
                                    disabled={blocked}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
