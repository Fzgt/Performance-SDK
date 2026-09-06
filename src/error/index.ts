import { config } from '../config';
import { W } from '../data/constants';
// rrweb hooks into this module for session replay on error
import { AskPriority } from '../typings/types';

type ErrorPayload = {
  type: 'js' | 'resource' | 'promise';
  [key: string]: unknown;
};

// An Error instance serialises to `{}` — pull the useful fields out first
const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
};

class ErrorTrace {
  private running = false;
  private previousOnError: OnErrorEventHandler = null;

  private report(payload: ErrorPayload) {
    // The SDK may be running before a logUrl was configured
    if (!config.reportData) {
      return;
    }
    config.reportData.sendToAnalytics(AskPriority.IDLE, JSON.stringify(payload));
  }

  // Uncaught sync/async errors.
  // Chains any handler the host page installed instead of clobbering it.
  private onGlobalError = (
    eventOrMessage: Event | string,
    scriptURI?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ): boolean => {
    this.report({
      type: 'js',
      message:
        typeof eventOrMessage === 'string' ? eventOrMessage : eventOrMessage.type,
      // Sourcemap resolution happens on the backend from this info
      scriptURI,
      lineno,
      colno,
      error: serializeError(error),
    });
    if (typeof this.previousOnError === 'function') {
      this.previousOnError.call(W, eventOrMessage, scriptURI, lineno, colno, error);
    }
    return true;
  };

  // Resource load failures, e.g. a 404 image.
  // These never reach window.onerror, only the capture phase.
  private onResourceError = (e: Event): void => {
    const target = e.target as
      | (HTMLElement & { src?: string; href?: string })
      | null;
    // A script error re-dispatched on window is not a resource failure
    if (!target || !target.tagName) {
      return;
    }
    const url = target.src || target.href;
    if (!url) {
      return;
    }
    this.report({ type: 'resource', tagName: target.tagName.toLowerCase(), url });
  };

  // Reported only — swallowing the rejection would hide the host app's errors
  private onRejection = (e: PromiseRejectionEvent): void => {
    this.report({ type: 'promise', ...serializeError(e.reason) });
  };

  public run() {
    // Running twice would double-report every error
    if (this.running) {
      return;
    }
    this.running = true;
    W.addEventListener('error', this.onResourceError, true);
    this.previousOnError = W.onerror;
    W.onerror = this.onGlobalError;
    W.addEventListener('unhandledrejection', this.onRejection);
  }

  public destroy() {
    if (!this.running) {
      return;
    }
    this.running = false;
    W.removeEventListener('error', this.onResourceError, true);
    W.removeEventListener('unhandledrejection', this.onRejection);
    // Only restore if nothing else took the handler in the meantime
    if (W.onerror === this.onGlobalError) {
      W.onerror = this.previousOnError;
    }
  }
}
export default ErrorTrace;
