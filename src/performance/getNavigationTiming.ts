import { WP } from '../data/constants';
import { isPerformanceSupported } from '../helpers/isSupported';
import { IPerfNavigationTiming } from '../typings/types';

/**
 * Navigation Timing API provides performance metrics for HTML documents.
 * w3c.github.io/navigation-timing/
 * developers.google.com/web/fundamentals/performance/navigation-and-resource-timing
 */
export const getNavigationTiming = (): IPerfNavigationTiming => {
  if (!isPerformanceSupported()) {
    return {};
  }
  // There is an open issue to type correctly getEntriesByType
  // github.com/microsoft/TypeScript/issues/33866
  // Direct assignment from performance.timing is deprecated, use getEntriesByType instead
  const n = WP.getEntriesByType('navigation')[0] as any;
  // In Safari version 11.2 Navigation Timing isn't supported yet
  if (!n) {
    return {};
  }
  const responseStart = n.responseStart;
  const responseEnd = n.responseEnd;
  // We cache the navigation time for future times
  return {
    // fetchStart marks when the browser starts to fetch a resource
    // responseEnd is when the last byte of the response arrives
    fetchTime: responseEnd - n.fetchStart,
    // Service worker time plus response time
    workerTime: n.workerStart > 0 ? responseEnd - n.workerStart : 0,
    // Request plus response time (network only)
    totalTime: responseEnd - n.requestStart,
    // Response time only (download)
    downloadTime: responseEnd - responseStart,
    // Time to First Byte (TTFB)
    timeToFirstByte: responseStart - n.requestStart,
    // HTTP header size
    headerSize: n.transferSize - n.encodedBodySize || 0,
    // DNS lookup time
    dnsLookupTime: n.domainLookupEnd - n.domainLookupStart,
    // TCP connection setup time
    tcpTime: n.connectEnd - n.connectStart || 0,
    // White screen time (time to first byte visible to the user)
    whiteTime: n.responseStart - n.navigationStart || 0,
    // Time until DOM content is fully parsed
    domTime: n.domContentLoadedEventEnd - n.navigationStart || 0,
    // Time until the page's onload fires
    loadTime: n.loadEventEnd - n.navigationStart || 0,
    // Time spent parsing the DOM
    parseDomTime: n.domComplete - n.domInteractive || 0,
  };
};
