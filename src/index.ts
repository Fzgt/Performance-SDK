/**
 * A free, open-source performance monitoring SDK.
 *
 * @remarks
 * Currently tracks metrics including FCP and more.
 *
 * @packageDocumentation
 */
import { config } from './config';
import { D, W, WN, WP } from './data/constants';
import { logData } from './data/log';
import { getNavigationTiming } from './performance/getNavigationTiming';
import {
  disconnectPerfObserversHidden,
  initPerformanceObserver,
} from './performance/observe';
import { isPerformanceSupported } from './tools/isSupported';
import { IReportData, IPerfOptions } from './typings/types';
import ErrorTrace from './error';
import analyticsTracker from './data/analyticsTracker';
import ReportData from './data/ReportData';
import { didVisibilityChange } from './helpers/onVisibilityChange';
import { getNetworkInformation } from './helpers/getNetworkInformation';
import { reportStorageEstimate } from './data/storageEstimate';

export default class PerfSDK {
  private v = '1.0.0';
  private reportData: IReportData;
  constructor(options: IPerfOptions = {}) {
    // Extend the base config
    const logUrl = options.logUrl;
    if (!logUrl) {
      throw new Error(`performance-sdk v${this.v}: logUrl is required`);
    }
    // Send data to the backend
    const insReportData = new ReportData({
      logUrl,
    });
    config.reportData = insReportData;
    // Expose the reporting interface
    this.reportData = insReportData;
    // Aggregate collected data
    const _analyticsTracker = options.analyticsTracker;
    if (_analyticsTracker) {
      config.analyticsTracker = _analyticsTracker;
    } else {
      config.analyticsTracker = analyticsTracker;
    }
    config.isResourceTiming = !!options.resourceTiming;
    config.isElementTiming = !!options.elementTiming;
    config.maxTime = options.maxMeasureTime || config.maxTime;

    if (options.captureError) {
      // Enable error tracking
      const errorTrace = new ErrorTrace();
      errorTrace.run();
    }

    // Bail out if the browser doesn't support performance metrics
    if (!isPerformanceSupported()) {
      return;
    }
    // Use PerformanceObserver-based metrics (FCP, etc.) if supported
    if ('PerformanceObserver' in W) {
      initPerformanceObserver();
    }
    // Initialize
    if (typeof D.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      D.addEventListener(
        'visibilitychange',
        didVisibilityChange.bind(this, disconnectPerfObserversHidden)
      );
    }
    // Record DNS lookup, white screen time, and other navigation timings
    logData('navigationTiming', getNavigationTiming());
    // Record the user's network speed
    logData('networkInformation', getNetworkInformation());
    // Manage offline cache usage data
    if (WN && WN.storage && typeof WN.storage.estimate === 'function') {
      WN.storage.estimate().then(reportStorageEstimate);
    }
  }
}
