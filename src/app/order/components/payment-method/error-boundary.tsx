"use client";

import { Component, type ReactNode } from "react";

type PaymentMethodErrorBoundaryProps = {
  fallback: (retry: () => void) => ReactNode;
  onReset?: () => void;
  children: ReactNode;
};

type PaymentMethodErrorBoundaryState = {
  hasError: boolean;
};

// Suspense only covers the loading state — a useSuspenseQuery error still
// throws during render, and React has no hook equivalent for catching that,
// only a class component. Only payment types the backend actually returned
// may be offered, so an error renders a retry state (no hardcoded list);
// `onReset` lets the caller reset the failed query before re-rendering.
class PaymentMethodErrorBoundary extends Component<
  PaymentMethodErrorBoundaryProps,
  PaymentMethodErrorBoundaryState
> {
  state: PaymentMethodErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  retry = () => {
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) return this.props.fallback(this.retry);

    return this.props.children;
  }
}

export default PaymentMethodErrorBoundary;
