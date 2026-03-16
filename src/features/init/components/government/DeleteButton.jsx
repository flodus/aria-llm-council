export default function DeleteButton({ onDelete, show = true }) {
    if (!show) return null;

    return (
        <button
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(200,80,80,0.35)',
            fontSize: '0.75rem',
            lineHeight: 1,
            padding: 0
        }}
        onClick={onDelete}
        >
        ✕
        </button>
    );
}
