import { config } from '../config';
import { W } from '../data/constants';
// rrweb hooks into this module for session replay on error
import { AskPriority } from '../typings/types';
type ErrorInfo = {};
class ErrorTrace {
  private errordefo: ErrorInfo;
  constructor() {
    this.errordefo = {};
  }
  // Capture uncaught sync/async errors globally
  private globalError() {
    W.onerror = (
      eventOrMessage: Event | string,
      scriptURI?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean => {
      const errorInfo = JSON.stringify({
        scriptURI,
        lineno,
        colno,
        error,
      });
      // Sourcemap resolution happens on the backend from this info
      config.reportData.sendToAnalytics(AskPriority.IDLE, errorInfo);
      return true;
    };
  }
  // Resource load failures, e.g. a 404 image
  private networkError() {
    W.addEventListener(
      'error',
      function (e: ErrorEvent) {
        if (e.target !== W) {
          // Resource load error
        }
      },
      true
    );
  }
  // Unhandled promise rejections
  private promiseError() {
    W.addEventListener('unhandledrejection', function (e) {
      e.preventDefault();
      return true;
    });
  }
  private iframeError() {
    const frames = W.frames;
    for (let i = 0; i < frames.length; i++) {
      frames[i].addEventListener(
        'error',
        (e) => {
          // iframe error
        },
        true
      );

      frames[i].addEventListener(
        'unhandledrejection',
        function (e) {
          // iframe unhandled rejection
        },
        true
      );
    }
  }
  // private consoleReflect() {
  //   const console_error = W.console.error;
  //   W.console.error = function () {
  //     config.reportData.sendToAnalytics(AskPriority.IDLE, errorInfo);
  //     console_error.apply(window, arguments);
  //   };
  // }
  public run() {
    this.networkError();
    // Wire up global sync/async error capture
    this.globalError();
    // Wire up promise rejection capture
    this.promiseError();
  }
}
export default ErrorTrace;
