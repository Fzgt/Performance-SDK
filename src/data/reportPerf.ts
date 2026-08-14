import { config } from '../config';
import { getNavigatorInfo } from '../helpers/getNavigatorInfo';
import { visibility } from '../helpers/onVisibilityChange';
import { pushTask } from '../helpers/utils';
import { getVitalsScore } from '../helpers/vitalsScore';

/**
 * Sends the User timing measure to analyticsTracker
 */
export const reportPerf = function (
  measureName: string,
  data: any,
  customProperties?: object
): void {
  pushTask(() => {
    // Don't report metrics while the page is hidden
    if (
      (visibility.isHidden && measureName.indexOf('Final') < 0) ||
      !config.analyticsTracker
    ) {
      return;
    }
    // Send metric to custom Analytics service
    config.analyticsTracker({
      metricName: measureName,
      data,
      eventProperties: customProperties || {},
      navigatorInformation: getNavigatorInfo(),
      vitalsScore: getVitalsScore(measureName, data),
    });
  });
};
