import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">:(</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Бірдеңе дұрыс болмады</h1>
            <p className="text-gray-600 mb-6">Қосымшада күтпеген қате орын алды.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Басты бетке оралу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
