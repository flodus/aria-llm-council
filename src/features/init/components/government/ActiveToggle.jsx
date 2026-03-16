import { BTN_SECONDARY } from '../../../../shared/theme';

export default function ActiveToggle({ isActive, color, onToggle, type = 'ministry' }) {
    const label = type === 'ministry'
    ? (isActive ? '● actif' : '○ inactif')
    : (isActive ? '● actif' : '○ inactif');

    return (
        <button
        style={{
            ...BTN_SECONDARY,
            fontSize: '0.38rem',
            padding: '0.14rem 0.42rem',
            ...(isActive ? {
                border: '1px solid ' + color + '55',
                color: color,
                background: color + '0E'
            } : {
                border: '1px solid rgba(200,80,80,0.25)',
                color: 'rgba(200,80,80,0.55)'
            })
        }}
        onClick={onToggle}
        >
        {label}
        </button>
    );
}
