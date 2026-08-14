import { AskPriority, IReportData } from '../typings/types';
import { W, WN } from './constants';

// Reporting transport
type TrackerOptions = {
  logUrl: string;
};
class ReportData implements IReportData {
  private logUrl: string;
  constructor(options: TrackerOptions) {
    const { logUrl } = options;
    if (logUrl) {
      this.logUrl = logUrl;
    } else {
      throw new Error('logUrl is required');
    }
  }
  public sendToAnalytics(level: AskPriority, body: string, uri?: string) {
    let logurl = this.logUrl;
    // Allow overriding the URL for this call
    if (uri) {
      logurl = uri;
    }
    if (level == AskPriority.URGENT) {
      if (!!W.fetch) {
        fetch(logurl, { body, method: 'POST', keepalive: true });
      } else {
        let xhr: XMLHttpRequest | null = new XMLHttpRequest();
        xhr.open('post', logurl, true);
        // Set the request content type
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body); // Send the payload
        xhr.onload = function (e) {
          // Release the reference so it can be collected
          xhr = null;
        };
      }
    } else if (level == AskPriority.IDLE) {
      if (!!WN.sendBeacon) {
        navigator.sendBeacon(logurl, body);
      } else {
        let img: HTMLImageElement | null = new Image();
        img.src = `${logurl}?body=${body}`;
        img.onload = function () {
          // Release the element once the request completes, to avoid leaks
          img = null;
        };
      }
    }
  }
}
export default ReportData;
