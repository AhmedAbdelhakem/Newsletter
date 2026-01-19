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
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-5">
                    <div className="bg-white p-8 rounded-xl shadow-xl max-w-xl w-full border border-red-200">
                        <h2 className="text-red-800 text-2xl font-bold mt-0 mb-3">Something went wrong</h2>
                        <p className="text-red-900 mb-5">The application encountered an unexpected error.</p>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-5 text-slate-700 text-[13px] font-mono overflow-x-auto">
                            {this.state.error && this.state.error.toString()}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-500 text-white border-0 px-5 py-2.5 rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
