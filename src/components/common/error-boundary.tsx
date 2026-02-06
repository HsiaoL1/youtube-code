import { Component, type ErrorInfo, type ReactNode } from 'react';
import { EmptyState } from './empty-state';

type State = { hasError: boolean };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <EmptyState title="页面出错" description="请刷新页面重试" />;
    }
    return this.props.children;
  }
}
