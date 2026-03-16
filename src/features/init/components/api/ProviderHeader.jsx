import { FONT } from '../../../../shared/theme';

export default function ProviderHeader({ provider, isOpen, onToggle, hasKey, status }) {
    const getStatusIcon = () => {
        if (status === 'ok') return '✅';
        if (status === 'debug') return '🐛';
        if (status === 'error') return '❌';
        if (hasKey) return '🔑';
        return '—';
    };

    const getStatusColor = () => {
        if (status === 'ok') return 'rgba(58,191,122,0.80)';
        if (status === 'debug') return 'rgba(180,140,80,0.80)';
        if (status === 'error') return 'rgba(200,58,58,0.80)';
        return 'rgba(140,160,200,0.35)';
    };

    return (
        <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.38rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(200,164,74,0.50)' }}>{isOpen ? '▾' : '▸'}</span>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.46rem', letterSpacing: '0.10em',
                color: isOpen ? 'rgba(200,164,74,0.88)' : 'rgba(200,215,240,0.70)', flex: 1 }}>{provider.label}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: '0.36rem', color: 'rgba(100,120,160,0.40)' }}>{provider.sub}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: '0.38rem', marginLeft: '0.4rem',
                    color: getStatusColor() }}>{getStatusIcon()}</span>
                    </button>
    );
}
