import { fcp, tbt } from '../data/metrics';
import { IPerformanceEntry } from '../typings/types';

export const initTotalBlockingTime = (
  performanceEntries: IPerformanceEntry[]
): void => {
  performanceEntries.forEach((entry) => {
    // Collect long tasks between FCP and TTI (self = task attributed to the render frame)
    if (entry.name !== 'self' || entry.startTime < fcp.value) {
      return;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API
    // A task counts as "long" once it runs over 50ms
    const blockingTime = entry.duration - 50;
    if (blockingTime > 0) {
      tbt.value += blockingTime;
    }
  });
};
