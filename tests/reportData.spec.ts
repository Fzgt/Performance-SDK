import ReportData from '../src/data/ReportData';
import { AskPriority } from '../src/typings/types';

describe('ReportData', () => {
  const url = 'https://example.test/log';

  afterEach(() => {
    delete (window as any).fetch;
    delete (navigator as any).sendBeacon;
    jest.restoreAllMocks();
  });

  it('refuses to construct without a logUrl', () => {
    expect(() => new ReportData({ logUrl: '' })).toThrow('logUrl is required');
  });

  describe('URGENT', () => {
    it('posts with keepalive and a JSON content type', () => {
      const fetchMock = jest.fn().mockResolvedValue(undefined);
      (window as any).fetch = fetchMock;

      new ReportData({ logUrl: url }).sendToAnalytics(
        AskPriority.URGENT,
        '{"a":1}'
      );

      expect(fetchMock).toHaveBeenCalledWith(url, {
        body: '{"a":1}',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    });

    it('swallows a failed report instead of rejecting into the host app', async () => {
      (window as any).fetch = jest.fn().mockRejectedValue(new Error('offline'));
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() =>
        new ReportData({ logUrl: url }).sendToAnalytics(AskPriority.URGENT, '{}')
      ).not.toThrow();

      await Promise.resolve();
      expect(warn).toHaveBeenCalled();
    });

    it('honours a per-call url override', () => {
      const fetchMock = jest.fn().mockResolvedValue(undefined);
      (window as any).fetch = fetchMock;

      new ReportData({ logUrl: url }).sendToAnalytics(
        AskPriority.URGENT,
        '{}',
        'https://other.test/log'
      );

      expect(fetchMock.mock.calls[0][0]).toBe('https://other.test/log');
    });
  });

  describe('IDLE', () => {
    it('prefers sendBeacon when available', () => {
      const beacon = jest.fn();
      (navigator as any).sendBeacon = beacon;

      new ReportData({ logUrl: url }).sendToAnalytics(AskPriority.IDLE, '{}');

      expect(beacon).toHaveBeenCalledWith(url, '{}');
    });

    it('encodes the payload into the image fallback url', () => {
      const created: any[] = [];
      const OriginalImage = (globalThis as any).Image;
      (globalThis as any).Image = class {
        src = '';
        onload: (() => void) | null = null;
        constructor() {
          created.push(this);
        }
      };

      // A JSON body containing & and # would truncate the query string unencoded
      const body = '{"msg":"a&b#c"}';
      new ReportData({ logUrl: url }).sendToAnalytics(AskPriority.IDLE, body);

      expect(created).toHaveLength(1);
      expect(created[0].src).toBe(`${url}?body=${encodeURIComponent(body)}`);
      expect(created[0].src).not.toContain('&b');

      (globalThis as any).Image = OriginalImage;
    });
  });
});
