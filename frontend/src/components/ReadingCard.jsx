import { Pencil, Trash2 } from "lucide-react";
import "./ReadingCard.css";

const SLOT_COLORS = {
    BEFOREBREAKFAST: "slot-1",
    AFTERBREAKFAST:  "slot-2",
    AFTERLUNCH:      "slot-3",
    AFTERDINNER:     "slot-4",
};

export default function ReadingCard({ reading, onEdit, onDelete, deleting }) {
    const colorClass = SLOT_COLORS[reading.slot] ?? "slot-1";

    return (
        <div className={`reading-card ${colorClass}`}>
            <div className="rc-left">
                <span className="rc-dot" />
                <div>
                    <p className="rc-slot">{reading.slotDisplay}</p>
                </div>
            </div>

            <div className="rc-right">
                <span className="rc-value">
                    {reading.value}
                    <span className="rc-unit"> mg/dL</span>
                </span>

                <div className="rc-actions">
                    <button
                        className="rc-btn edit"
                        onClick={onEdit}
                        aria-label={`Edit ${reading.slotDisplay} reading`}
                        title="Edit"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        className="rc-btn delete"
                        onClick={onDelete}
                        disabled={deleting}
                        aria-label={`Delete ${reading.slotDisplay} reading`}
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
