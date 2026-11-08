import { useEffect, useState } from "react";
import "./ReadingForm.css";

const SLOTS = [
    { value: "BEFOREBREAKFAST", label: "Morning (fasting)" },
    { value: "AFTERBREAKFAST",  label: "After breakfast"   },
    { value: "AFTERLUNCH",      label: "After lunch"       },
    { value: "AFTERDINNER",     label: "After dinner"      },
];

// Earliest local hour each slot becomes valid
const SLOT_START_HOUR = {
    BEFOREBREAKFAST: 0,
    AFTERBREAKFAST:  8,
    AFTERLUNCH:      12,
    AFTERDINNER:     17,
};

/**
 * Returns true when the slot is still in the future for today.
 * Past dates are never restricted.
 */
function isSlotFuture(dateStr, slotValue) {
    const todayStr = new Date().toLocaleDateString("en-CA");
    if (dateStr !== todayStr) return false;
    return new Date().getHours() < SLOT_START_HOUR[slotValue];
}

/**
 * Shared form used for both adding and editing a reading.
 *
 * Props:
 *   date          – "YYYY-MM-DD" string, pre-filled and readonly when adding
 *   takenSlots    – string[], slots already used on this date (for add mode)
 *   initial       – { value, slot } when editing; undefined when adding
 *   onSubmit(data)– called with { value: number, readingDate, slot }
 *   onCancel()    – called when user dismisses the form
 *   busy          – disables submit while request is in flight
 *   error         – server-side error string to display
 */
export default function ReadingForm({
    date,
    takenSlots = [],
    initial,
    onSubmit,
    onCancel,
    busy,
    error,
}) {
    const isEdit = Boolean(initial);

    const [value, setValue] = useState(initial?.value?.toString() ?? "");
    const [slot,  setSlot]  = useState(initial?.slot  ?? "");

    // Keep local state in sync if parent swaps the initial prop (e.g. opening
    // a different reading's edit form without unmounting this component).
    useEffect(() => {
        setValue(initial?.value?.toString() ?? "");
        setSlot(initial?.slot ?? "");
    }, [initial]);

    // ── Client-side validation ─────────────────────────────────────────────
    const [localError, setLocalError] = useState("");

    function validate() {
        if (!value && value !== 0) {
            setLocalError("Please enter a glucose value.");
            return false;
        }
        const num = Number(value);
        if (!Number.isInteger(num) || num < 40 || num > 600) {
            setLocalError("Value must be between 40 and 600 mg/dL.");
            return false;
        }
        if (!slot) {
            setLocalError("Please select a time slot.");
            return false;
        }
        setLocalError("");
        return true;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({ value: Number(value), readingDate: date, slot });
    }

    const displayError = localError || error;

    // Available slots: in edit mode show all; in add mode hide already-taken ones
    // Future slots on today's date are shown but disabled (greyed out with tooltip)
    const availableSlots = isEdit
        ? SLOTS
        : SLOTS.filter((s) => !takenSlots.includes(s.value));

    // For the "all taken" check, exclude future slots too
    const selectableSlots = availableSlots.filter(
        (s) => !isSlotFuture(date, s.value)
    );

    return (
        <form className="reading-form" onSubmit={handleSubmit} noValidate>
            <h3 className="reading-form-title">
                {isEdit ? "Edit reading" : "Add reading"}
            </h3>

            {/* Date (informational, always the selected dashboard date) */}
            <div className="rf-field">
                <label htmlFor="rf-date">Date</label>
                <input id="rf-date" type="text" value={date} readOnly className="rf-readonly" />
            </div>

            {/* Slot selector */}
            <div className="rf-field">
                <span id="rf-slot-label">Time slot</span>
                {isEdit ? (
                    /* In edit mode the slot is fixed — only value can change */
                    <input
                        id="rf-slot"
                        type="text"
                        value={SLOTS.find((s) => s.value === slot)?.label ?? slot}
                        readOnly
                        className="rf-readonly"
                    />
                ) : (
                    <div className="rf-slot-grid" role="group" aria-labelledby="rf-slot-label">
                        {availableSlots.map((s) => {
                            const isFuture = isSlotFuture(date, s.value);
                            return (
                                <button
                                    key={s.value}
                                    type="button"
                                    className={
                                        "rf-slot-btn" +
                                        (slot === s.value ? " selected" : "") +
                                        (isFuture ? " future" : "")
                                    }
                                    onClick={() => !isFuture && setSlot(s.value)}
                                    disabled={isFuture}
                                    aria-pressed={slot === s.value}
                                    title={isFuture ? "This slot is not available yet" : undefined}
                                >
                                    {s.label}
                                    {isFuture && (
                                        <span className="rf-slot-future-tag">Not yet</span>
                                    )}
                                </button>
                            );
                        })}
                        {selectableSlots.length === 0 && (
                            <p className="rf-all-taken">
                                All available slots for this date are filled.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Value input */}
            <div className="rf-field">
                <label htmlFor="rf-value">
                    Glucose value <span className="rf-unit">(mg/dL)</span>
                </label>
                <input
                    id="rf-value"
                    type="number"
                    inputMode="numeric"
                    min="40"
                    max="600"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 95"
                />
            </div>

            {/* Error */}
            {displayError && (
                <p className="rf-error" role="alert">{displayError}</p>
            )}

            {/* Actions */}
            <div className="rf-actions">
                <button
                    type="button"
                    className="rf-btn-cancel"
                    onClick={onCancel}
                    disabled={busy}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rf-btn-submit"
                    disabled={busy || selectableSlots.length === 0}
                >
                    {busy ? "Saving…" : isEdit ? "Save changes" : "Add reading"}
                </button>
            </div>
        </form>
    );
}
