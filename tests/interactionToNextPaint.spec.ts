import {
  getInteractionToNextPaint,
  processInteractionEntry,
  resetInteractions,
} from '../src/performance/interactionToNextPaint';
import { PerformanceEventTiming } from '../src/typings/types';

const entry = (
  overrides: Partial<PerformanceEventTiming>
): PerformanceEventTiming =>
  ({
    entryType: 'event',
    name: 'pointerdown',
    startTime: 0,
    duration: 0,
    processingStart: 0,
    ...overrides,
  } as PerformanceEventTiming);

describe('interaction to next paint', () => {
  beforeEach(() => {
    resetInteractions();
    delete (performance as any).interactionCount;
  });

  it('reports nothing until the user interacts', () => {
    expect(getInteractionToNextPaint()).toBeNull();
  });

  it('reports the latency of a single interaction', () => {
    processInteractionEntry(entry({ interactionId: 1, duration: 120 }));
    expect(getInteractionToNextPaint()).toBe(120);
  });

  it('keeps the worst event of an interaction, not the sum', () => {
    // One click fires pointerdown, pointerup and click under the same id
    processInteractionEntry(entry({ interactionId: 1, duration: 48 }));
    processInteractionEntry(entry({ interactionId: 1, duration: 210 }));
    processInteractionEntry(entry({ interactionId: 1, duration: 64 }));
    expect(getInteractionToNextPaint()).toBe(210);
  });

  it('ignores events that are not part of an interaction', () => {
    processInteractionEntry(entry({ duration: 900 }));
    expect(getInteractionToNextPaint()).toBeNull();
  });

  it('accepts a first-input entry with no interactionId', () => {
    processInteractionEntry(
      entry({ entryType: 'first-input', duration: 150, startTime: 12 })
    );
    expect(getInteractionToNextPaint()).toBe(150);
  });

  it('does not count a first-input that duplicates a recorded event', () => {
    processInteractionEntry(
      entry({ interactionId: 1, duration: 150, startTime: 12 })
    );
    processInteractionEntry(
      entry({ entryType: 'first-input', duration: 150, startTime: 12 })
    );
    processInteractionEntry(
      entry({ interactionId: 2, duration: 90, startTime: 300 })
    );
    // Without deduplication the slowest interaction would be counted twice
    // and 150 would still be the 98th percentile below
    (performance as any).interactionCount = 50;
    expect(getInteractionToNextPaint()).toBe(90);
  });

  it('drops one outlier per 50 interactions', () => {
    for (let i = 1; i <= 51; i++) {
      processInteractionEntry(entry({ interactionId: i, duration: i * 10 }));
    }
    // 51 interactions: the slowest (510) is allowed to be discarded
    expect(getInteractionToNextPaint()).toBe(500);
  });

  it('prefers the browser interaction count over the observed one', () => {
    processInteractionEntry(entry({ interactionId: 1, duration: 300 }));
    processInteractionEntry(entry({ interactionId: 2, duration: 100 }));
    expect(getInteractionToNextPaint()).toBe(300);
    // The browser saw interactions we never kept, so an outlier is dropped
    (performance as any).interactionCount = 60;
    expect(getInteractionToNextPaint()).toBe(100);
  });
});
