import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Une erreur inattendue est survenue', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4 text-center">
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wide">
              Oups, quelque chose ne s'est pas passé comme prévu
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Nous rencontrons une erreur inattendue</h1>
            <p className="text-gray-600">
              L'interface n'a pas pu se charger correctement. Essayez d'actualiser la page ou de revenir à l'accueil. Si le problème
              persiste, contactez le support SecunologieCI.
            </p>
            {this.state.message && (
              <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                Détail technique : {this.state.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                className="px-6 py-3 rounded-full bg-brand-green-600 text-white font-semibold hover:bg-brand-green-700 transition-colors"
                onClick={() => window.location.assign('/')}
              >
                Retour à l'accueil
              </button>
              <button
                type="button"
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => window.location.reload()}
              >
                Actualiser la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
