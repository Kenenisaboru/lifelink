/**
 * ErrorBoundary — React error boundary with Sentry crash reporting
 * Captures uncaught React render errors and reports them to Sentry
 * with full breadcrumb context for debugging
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { COLORS } from '../theme/colors';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  /** Custom fallback component to show on error */
  fallback?: ReactNode;
  /** Called when error is caught — useful for parent-level recovery */
  onError?: (error: Error, info: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report to Sentry with full component stack
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack ?? '',
        },
      },
      tags: {
        platform: Platform.OS,
        errorBoundary: 'LifeLink',
      },
    });

    this.setState({ eventId });

    // Add a breadcrumb for the error
    Sentry.addBreadcrumb({
      category: 'ErrorBoundary',
      message: `Caught error: ${error.message}`,
      level: 'error',
      data: {
        componentStack: errorInfo.componentStack ?? '',
      },
    });

    console.error('[LifeLink ErrorBoundary] Uncaught error:', error.message);
    console.error('Component stack:', errorInfo.componentStack);

    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  handleReportFeedback = (): void => {
    if (this.state.eventId) {
      const showReportDialog = (Sentry as typeof Sentry & {
        showReportDialog?: (options: { eventId: string }) => void;
      }).showReportDialog;

      if (typeof showReportDialog === 'function') {
        showReportDialog({ eventId: this.state.eventId });
      }
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message ||
                'An unexpected error occurred in LifeLink. Our team has been notified.'}
            </Text>

            {/* Error details in development */}
            {__DEV__ && this.state.error && (
              <View style={styles.devBox}>
                <Text style={styles.devLabel}>DEV INFO</Text>
                <Text style={styles.devText} numberOfLines={4}>
                  {this.state.error.stack?.split('\n').slice(0, 3).join('\n') ?? ''}
                </Text>
              </View>
            )}

            {this.state.eventId && (
              <Text style={styles.eventId}>
                Error ID: {this.state.eventId.slice(0, 8)}
              </Text>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>🔄 Try Again</Text>
            </TouchableOpacity>

            {this.state.eventId && (
              <TouchableOpacity
                style={styles.reportBtn}
                onPress={this.handleReportFeedback}
              >
                <Text style={styles.reportText}>📝 Send Error Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  devBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  devLabel: {
    color: COLORS.accentYellow,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  devText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    lineHeight: 14,
  },
  eventId: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  reportBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});
