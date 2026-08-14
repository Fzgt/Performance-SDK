import { W } from '../data/constants';

export const roundByTwo = (num: number) => {
  return parseFloat(num.toFixed(2));
};

export const convertToMB = (bytes: number): number | null => {
  if (typeof bytes !== 'number') {
    return null;
  }
  return roundByTwo(bytes / Math.pow(1024, 2));
};

/**
 * PushTask to requestIdleCallback
 * Collects data during idle frames to avoid blocking rendering
 */
export const pushTask = (cb: any): void => {
  if ('requestIdleCallback' in W) {
    (W as any).requestIdleCallback(cb, { timeout: 3000 });
  } else {
    cb();
  }
};
