import { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

/**
 * Themed modal confirmation dialog — replaces window.confirm().
 *
 * Props:
 *   isOpen        – boolean, controls visibility
 *   title         – dialog heading
 *   message       – body text
 *   confirmLabel  – label for the confirm button (default "Confirm")
 *   cancelLabel   – label for the cancel button (default "Cancel")
 *   variant       – "danger" | "warning" | "default" (default "default")
 *   onConfirm()   – called when user confirms
 *   onCancel()    – called when user cancels or presses Escape
 */
export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel  = "Cancel",
    variant      = "default",
    onConfirm,
    onCancel,
}) {
    const cancelRef = useRef(null);

    // Focus the cancel button when opened (safer default)
    useEffect(() => {
        if (isOpen) cancelRef.current?.focus();
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        function onKey(e) {
            if (e.key === "Escape") onCancel();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        /* Backdrop */
        <div
            className="dialog-backdrop"
            onClick={onCancel}
            role="presentation"
        >
            {/* Panel — stop clicks propagating to backdrop */}
            <div
                className={`dialog-panel dialog-${variant}`}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-message"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="dialog-title" className="dialog-title">{title}</h2>
                {message && (
                    <p id="dialog-message" className="dialog-message">{message}</p>
                )}

                <div className="dialog-actions">
                    <button
                        ref={cancelRef}
                        className="dialog-btn-cancel"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`dialog-btn-confirm dialog-btn-${variant}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
