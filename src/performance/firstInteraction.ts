import { logData, logMetric } from '../data/log';
import { cls, lcp, rt, tbt } from '../data/metrics';
import {
  getInteractionToNextPaint,
  processInteractionEntry,
} from './interactionToNextPaint';
import { perfObservers } from './observeInstances';
import { poDisconnect } from './performanceObserver';
import { PerformanceEventTiming } from '../typings/types';

/**
 * The first interaction is the point where the load-time metrics stop moving,
 * so it is used as the trigger to report them.
 */
export const initFirstInteraction = (
  performanceEntries: PerformanceEventTiming[]
) => {
  // The first input also counts towards INP
  performanceEntries.forEach(processInteractionEntry);
  // Disconnect the first-input observer once fired, to avoid leaking observers
  poDisconnect(1);
  // Report LCP
  logMetric(lcp.value, 'lcp');
  if (perfObservers[3] && typeof perfObservers[3].takeRecords === 'function') {
    perfObservers[3].takeRecords();
  }
  logMetric(cls.value, 'cls');
  logMetric(tbt.value, 'tbt');
  // Provisional INP. The value can only grow, so it is reported again as
  // `inpFinal` when the page is hidden.
  const inp = getInteractionToNextPaint();
  if (inp !== null) {
    logMetric(inp, 'inp');
  }
  // TBT with 5 second delay after the first interaction
  setTimeout(() => {
    logMetric(tbt.value, `tbt5S`);
  }, 5000);
  // TBT with 10 second delay after the first interaction
  setTimeout(() => {
    logMetric(tbt.value, `tbt10S`);
    // Total data consumption 10s after the first interaction
    logData('dataConsumption', rt.value);
  }, 10000);
};
