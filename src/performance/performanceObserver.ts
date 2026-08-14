import { C } from '../data/constants';
import { perfObservers } from './observeInstances';
import { IPerformanceObserverType } from '../typings/types';

/**
 * Async subscription wrapper around PerformanceObserver
 */
export const po = (
  eventType: IPerformanceObserverType,
  cb: (performanceEntries: any[]) => void
): PerformanceObserver | null => {
  try {
    const perfObserver = new PerformanceObserver((entryList) => {
      cb(entryList.getEntries());
    });
    // buffered: true replays entries recorded before this observer was created
    perfObserver.observe({ type: eventType, buffered: true });
    return perfObserver;
  } catch (e) {
    C.warn('PerfSDK.js:', e);
  }
  return null;
};
// Disconnect and clean up an observer instance
export const poDisconnect = (observer: any) => {
  if (perfObservers[observer]) {
    perfObservers[observer].disconnect();
  }
  delete perfObservers[observer];
};
