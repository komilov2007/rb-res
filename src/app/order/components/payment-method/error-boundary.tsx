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
