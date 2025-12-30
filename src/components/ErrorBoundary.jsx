import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fef2f2',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        maxWidth: '600px',
                        width: '100%',
                        border: '1px solid #fecaca'
                    }}>
                        <h2 style={{ color: '#991b1b', marginTop: 0, marginBottom: '10px' }}>Something went wrong</h2>
                        <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>The application encountered an unexpected error.</p>

                        <div style={{
                            background: '#f8fafc',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            marginBottom: '20px',
                            color: '#334155',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            overflowX: 'auto'
                        }}>
                            {this.state.error && this.state.error.toString()}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.target.style.background = '#dc2626'}
                            onMouseOut={e => e.target.style.background = '#ef4444'}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
