import { config } from '../src/config';
import ErrorTrace from '../src/error/Index';
import { AskPriority } from '../src/typings/types';

describe('ErrorTrace', () => {
  let sent: Array<{ level: AskPriority; body: any }>;
  let traces: ErrorTrace[];

  const start = () => {
    const trace = new ErrorTrace();
    traces.push(trace);
    trace.run();
    return trace;
  };

  beforeEach(() => {
    sent = [];
    traces = [];
    config.reportData = {
      sendToAnalytics: (level, body) => {
        sent.push({ level, body: JSON.parse(body) });
      },
    };
    start();
  });

  afterEach(() => {
    traces.forEach((trace) => trace.destroy());
    config.reportData = null;
    window.onerror = null;
    document.body.innerHTML = '';
  });

  it('reports a failed resource load, which never reaches window.onerror', () => {
    const img = document.createElement('img');
    img.src = 'https://example.test/missing.png';
    document.body.appendChild(img);

    img.dispatchEvent(new Event('error'));

    expect(sent).toHaveLength(1);
    expect(sent[0].level).toBe(AskPriority.IDLE);
    expect(sent[0].body).toMatchObject({
      type: 'resource',
      tagName: 'img',
      url: 'https://example.test/missing.png',
    });
  });

  it('ignores an error event on a node with no url', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    div.dispatchEvent(new Event('error'));

    expect(sent).toHaveLength(0);
  });

  it('reports an unhandled rejection without swallowing it', () => {
    const preventDefault = jest.fn();
    const event: any = new Event('unhandledrejection');
    event.reason = new Error('boom');
    event.preventDefault = preventDefault;

    window.dispatchEvent(event);

    expect(sent).toHaveLength(1);
    expect(sent[0].body).toMatchObject({ type: 'promise', message: 'boom' });
    expect(sent[0].body.stack).toBeDefined();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('serialises the Error instead of dropping it as an empty object', () => {
    window.onerror!('Uncaught boom', 'app.js', 12, 34, new Error('boom'));

    expect(sent[0].body).toMatchObject({
      type: 'js',
      message: 'Uncaught boom',
      scriptURI: 'app.js',
      lineno: 12,
      colno: 34,
    });
    expect(sent[0].body.error).toMatchObject({ name: 'Error', message: 'boom' });
  });

  it('keeps a handler the host page installed before the SDK', () => {
    const previous = jest.fn();
    window.onerror = previous;
    start();

    window.onerror!('boom', 'app.js', 1, 1, new Error('boom'));

    expect(previous).toHaveBeenCalled();
    expect(sent).toHaveLength(1);
  });

  it('stops reporting once destroyed', () => {
    traces.forEach((trace) => trace.destroy());

    const img = document.createElement('img');
    img.src = 'https://example.test/missing.png';
    document.body.appendChild(img);
    img.dispatchEvent(new Event('error'));

    expect(sent).toHaveLength(0);
  });

  it('does not double-report when run twice', () => {
    traces[0].run();

    const img = document.createElement('img');
    img.src = 'https://example.test/missing.png';
    document.body.appendChild(img);
    img.dispatchEvent(new Event('error'));

    expect(sent).toHaveLength(1);
  });

  it('drops reports when no logUrl has been configured yet', () => {
    config.reportData = null;
    const img = document.createElement('img');
    img.src = 'https://example.test/missing.png';
    document.body.appendChild(img);

    expect(() => img.dispatchEvent(new Event('error'))).not.toThrow();
  });
});
