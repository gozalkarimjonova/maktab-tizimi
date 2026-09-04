export default function Modal({ open, onClose, title, children }) {
    if (!open) return null
    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                {children}
            </div>
        </div>
    )
}