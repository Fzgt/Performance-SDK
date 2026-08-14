export interface IPerfDataConsumption {
  beacon: number;
  css: number;
  fetch: number;
  img: number;
  other: number;
  script: number;
  total: number;
  xmlhttprequest: number;
}
export interface IPerfNavigationTiming {
  fetchTime?: number;
  workerTime?: number;
  totalTime?: number;
  downloadTime?: number;
  timeToFirstByte?: number;
  headerSize?: number;
  dnsLookupTime?: number;
  tcpTime?: number;
  whiteTime?: number;
  domTime?: number;
  loadTime?: number;
  parseDomTime?: number;
}
export type EffectiveConnectionType =
  | '2g'
  | '3g'
  | '4g'
  | '5g'
  | 'slow-2g'
  | 'lte';
export interface IPerfNetworkInformation {
  downlink?: number;
  effectiveType?: EffectiveConnectionType;
  onchange?: () => void;
  rtt?: number;
  saveData?: boolean;
}
export type IPerfData =
  | number
  | IPerfNavigationTiming
  | IPerfNetworkInformation;

export interface INavigatorInfo {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  isLowEndDevice?: boolean;
  isLowEndExperience?: boolean;
  serviceWorkerStatus?: 'controlled' | 'supported' | 'unsupported';
}
export type IVitalsScore = 'good' | 'needsImprovement' | 'poor' | null;

export interface IAnalyticsTrackerOptions {
  metricName: string;
  data: IPerfData;
  eventProperties: object;
  navigatorInformation: INavigatorInfo;
  vitalsScore: IVitalsScore;
}
export interface IPerfOptions {
  // Metrics
  captureError?: boolean;
  resourceTiming?: boolean;
  elementTiming?: boolean;
  // Analytics
  analyticsTracker?: (options: IAnalyticsTrackerOptions) => void;
  // Logging
  maxMeasureTime?: number;
  logUrl?: string;
}
export interface IReportData {
  sendToAnalytics(level: AskPriority, body: string): void;
}
/**
 * @param isResourceTiming - Whether resource timing capture is enabled
 * @param isElementTiming - Whether element timing capture is enabled
 * @param analyticsTracker - Custom analytics consumer, receives IAnalyticsTrackerOptions
 * @param maxTime - Maximum measurable duration
 * @interface SDK runtime config interface
 * @public
 */
export interface IPerfConfig {
  reportData: IReportData;
  isResourceTiming: boolean;
  isElementTiming: boolean;
  analyticsTracker?: (options: IAnalyticsTrackerOptions) => void;
  maxTime: number;
}

export interface IPerfObservers {
  [measureName: string]: any;
}
// Performance entry types
export type IPerformanceObserverType =
  | 'first-input'
  | 'largest-contentful-paint'
  | 'layout-shift'
  | 'longtask'
  | 'measure'
  | 'navigation'
  | 'paint'
  | 'element'
  | 'resource';
// Resource entry initiator types
export type IPerformanceEntryInitiatorType =
  | 'beacon'
  | 'css'
  | 'fetch'
  | 'img'
  | 'other'
  | 'script'
  | 'xmlhttprequest';
export declare interface IPerformanceEntry {
  decodedBodySize?: number;
  duration: number;
  entryType: IPerformanceObserverType;
  initiatorType?: IPerformanceEntryInitiatorType;
  loadTime: number;
  name: string;
  renderTime: number;
  startTime: number;
  hadRecentInput?: boolean;
  value?: number;
  identifier?: string;
}
// Recorded metric flags
export interface IMetricMap {
  [measureName: string]: boolean;
}
// https://wicg.github.io/event-timing/#sec-performance-event-timing
export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: DOMHighResTimeStamp;
  target?: Node;
}
// Reporting priority
export enum AskPriority {
  URGENT = 1,
  IDLE = 2,
}
