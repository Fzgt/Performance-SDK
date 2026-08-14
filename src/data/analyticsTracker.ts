import { IAnalyticsTrackerOptions } from '../typings/types';
// Built-in fallback tracker used when no custom analyticsTracker is provided.
// Simply logs the collected metric so it's still visible without a backend wired up.
const analyticsTracker = (options: IAnalyticsTrackerOptions): void => {
  console.log(options);
};
export default analyticsTracker;
