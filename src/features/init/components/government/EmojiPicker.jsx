// src/features/init/components/government/EmojiPicker.jsx

import { INPUT_STYLE } from '../../../../shared/theme';

export default function EmojiPicker({ emoji, onChange, disabled = false, size = '1rem' }) {
    return (
        <input
        style={{
            ...INPUT_STYLE,
            width: '2.2rem',
            textAlign: 'center',
            fontSize: size,
            ...(disabled ? { opacity: 0.35, cursor: 'not-allowed' } : {})
        }}
        readOnly={disabled}
        value={emoji}
        onChange={onChange}
        placeholder="🌟"
        />
    );
}
