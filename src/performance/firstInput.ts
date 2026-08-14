import { logData, logMetric } from '../data/log';
import { cls, lcp, rt, tbt } from '../data/metrics';
import { perfObservers } from './observeInstances';
import { poDisconnect } from './performanceObserver';
import { PerformanceEventTiming } from '../typings/types';

export const initFirstInputDelay = (
  performanceEntries: PerformanceEventTiming[]
) => {
  // The last entry is the one we care about
  const lastEntry = performanceEntries.pop();
  if (lastEntry) {
    // Core Web Vitals FID logic
    // Measure the delay before the input event starts processing
    logMetric(lastEntry.processingStart - lastEntry.startTime, 'fidVitals', {
      performanceEntry: lastEntry,
    });
    // Legacy FID logic
    // Measure the duration of processing the first input event
    logMetric(lastEntry.duration, 'fid', {
      performanceEntry: lastEntry,
    });
  }
  // Disconnect the FID observer once fired, to avoid leaking observers
  poDisconnect(1);
  // Report LCP
  logMetric(lcp.value, 'lcp');
  if (perfObservers[3] && typeof perfObservers[3].takeRecords === 'function') {
    perfObservers[3].takeRecords();
  }
  logMetric(cls.value, 'cls');
  logMetric(tbt.value, 'tbt');
  // TBT with 5 second delay after FID
  setTimeout(() => {
    logMetric(tbt.value, `tbt5S`);
  }, 5000);
  // TBT with 10 second delay after FID
  setTimeout(() => {
    logMetric(tbt.value, `tbt10S`);
    // Total data consumption 10s after FID fires
    logData('dataConsumption', rt.value);
  }, 10000);
};
