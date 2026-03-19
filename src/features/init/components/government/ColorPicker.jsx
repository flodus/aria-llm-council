// src/features/init/components/government/ColorPicker.jsx

export default function ColorPicker({ color, onChange, disabled = false }) {
    return (
        <input
        type="color"
        value={color}
        disabled={disabled}
        style={{
            width: '1.8rem',
            height: '1.6rem',
            border: 'none',
            background: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.3 : 1
        }}
        onChange={onChange}
        />
    );
}
