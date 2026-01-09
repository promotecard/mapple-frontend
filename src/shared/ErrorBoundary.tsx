import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[UI ErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h1 className="text-xl font-semibold text-slate-900">Se produjo un error</h1>
            <p className="mt-2 text-sm text-slate-600">
              La pantalla falló, pero la app sigue viva. Revisa consola para más detalle.
            </p>
            <pre className="mt-4 text-xs bg-slate-100 p-3 rounded overflow-auto">
              {this.state.message}
            </pre>
            <button
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white text-sm"
              onClick={() => window.location.reload()}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
