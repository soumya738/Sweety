import { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

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
    const panelRef = useRef(null);

    // Keep keyboard focus in the modal and return it to the invoking control.
    useEffect(() => {
        if (!isOpen) return;
        const previousFocus = document.activeElement;
        cancelRef.current?.focus();
        return () => {
            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
                previousFocus.focus();
            }
        };
    }, [isOpen]);

    // Close on Escape and trap Tab navigation inside the modal.
    useEffect(() => {
        if (!isOpen) return;
        function onKey(e) {
            if (e.key === "Escape") {
                onCancel();
                return;
            }
            if (e.key !== "Tab") return;

            const focusable = panelRef.current?.querySelectorAll(
                'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable?.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!panelRef.current.contains(document.activeElement)) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
            } else if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="dialog-backdrop"
            onClick={onCancel}
            role="presentation"
        >
            <div
                ref={panelRef}
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
