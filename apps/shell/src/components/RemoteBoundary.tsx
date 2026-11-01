"use client";

import { Component, type ReactNode } from "react";

interface Props {
  name: string;
  children: ReactNode;
}

/** One broken micro-frontend must never take the whole shell down with it. */
export class RemoteBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[remote:${this.props.name}]`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="ob-card" role="alert">
          <h2>{this.props.name} is unavailable</h2>
          <p className="ob-muted">The rest of the dashboard still works. Try again in a moment.</p>
          <button type="button" className="ob-btn" onClick={() => this.setState({ error: null })}>
            Retry
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
