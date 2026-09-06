import { config } from '../config';
import { logMetric } from '../data/log';
import { cls, lcp, tbt } from '../data/metrics';
import { initLayoutShift } from './cumulativeLayoutShift';
import { initFirstInteraction } from './firstInteraction';
import {
  getInteractionToNextPaint,
  initInteractionToNextPaint,
  INP_DURATION_THRESHOLD,
} from './interactionToNextPaint';
import { perfObservers } from './observeInstances';
import {
  initElementTiming,
  initFirstPaint,
  initLargestContentfulPaint,
} from './paint';
import { po, poDisconnect } from './performanceObserver';
import { initResourceTiming } from './resourceTiming';
export const initPerformanceObserver = (): void => {
  perfObservers[0] = po('paint', initFirstPaint);
  perfObservers[1] = po('first-input', initFirstInteraction);
  perfObservers[2] = po('largest-contentful-paint', initLargestContentfulPaint);
  // Collect all page resource timing data
  if (config.isResourceTiming) {
    po('resource', initResourceTiming);
  }
  perfObservers[3] = po('layout-shift', initLayoutShift);
  if (config.isElementTiming) {
    po('element', initElementTiming);
  }
  // INP watches every interaction until the page is hidden, unlike the
  // one-shot observers above
  perfObservers[5] = po('event', initInteractionToNextPaint, {
    durationThreshold: INP_DURATION_THRESHOLD,
  });
};

export const disconnectPerfObserversHidden = (): void => {
  if (perfObservers[2]) {
    logMetric(lcp.value, `lcpFinal`);
    poDisconnect(2);
  }
  if (perfObservers[3]) {
    if (typeof perfObservers[3].takeRecords === 'function') {
      perfObservers[3].takeRecords();
    }
    logMetric(cls.value, `clsFinal`);
    poDisconnect(3);
  }
  if (perfObservers[4]) {
    logMetric(tbt.value, `tbtFinal`);
    poDisconnect(4);
  }
  if (perfObservers[5]) {
    const inp = getInteractionToNextPaint();
    // Stays unreported when the user never interacted with the page
    if (inp !== null) {
      logMetric(inp, `inpFinal`);
    }
    poDisconnect(5);
  }
};
