import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.log('❌ Erreur capturée:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    padding: '40px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    border: '2px solid #ff00ff',
                    boxShadow: '0 0 30px #ff00ff'
                }}>
                <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🌍</h1>
                <h2 style={{ color: '#ff88ff', marginBottom: '20px' }}>
                Oups ! La planète a buggé
                </h2>
                <p style={{ marginBottom: '30px', color: '#888' }}>
                {this.state.error?.toString()}
                </p>
                <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '12px 30px',
                    fontSize: '18px',
                    backgroundColor: '#ff00ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
                >
                🔄 Réinitialiser
                </button>
                </div>
            );
        }

        return this.props.children;
    }
}
