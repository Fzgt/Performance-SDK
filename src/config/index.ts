import { IPerfConfig } from '../typings/types';

export const config: IPerfConfig = {
  // Metrics
  // Set by the PerfSDK constructor once a logUrl is known
  reportData: null,
  isResourceTiming: false,
  isElementTiming: false,
  // Logging
  maxTime: 15000,
};
