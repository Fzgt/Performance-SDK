import { WP } from '../data/constants';
import { PerformanceEventTiming } from '../typings/types';

/**
 * INP keeps the slowest interactions of the page and reports (roughly) the
 * 98th percentile, so a single unlucky interaction does not define the score.
 * https://web.dev/articles/inp
 */
const MAX_INTERACTIONS = 10;
// Ignore events too short to be perceived; matches the web-vitals default
export const INP_DURATION_THRESHOLD = 40;

interface IInteraction {
  id: number;
  latency: number;
  startTime: number;
}

// Slowest interactions so far, sorted by latency descending
const longestInteractions: IInteraction[] = [];
// Fallback counter for browsers without performance.interactionCount
let observedInteractions = 0;

/**
 * Total interaction count of the page. Chrome exposes it directly, which is
 * more accurate than our list because we only keep the slowest ones.
 */
const getInteractionCount = (): number => {
  const nativeCount = (WP as any).interactionCount;
  return typeof nativeCount === 'number' ? nativeCount : observedInteractions;
};

/**
 * Feeds one `event` / `first-input` entry into the interaction list.
 * A single interaction fires several events (pointerdown, pointerup, click...)
 * sharing one interactionId, so entries are grouped and only the worst kept.
 */
export const processInteractionEntry = (entry: PerformanceEventTiming) => {
  const id = entry.interactionId || 0;
  // Events that aren't part of an interaction carry no interactionId.
  // `first-input` is the exception: browsers may report it without one.
  if (!id && entry.entryType !== 'first-input') {
    return;
  }
  if (!id) {
    // The same input may arrive twice, once as first-input and once as event
    const isDuplicate = longestInteractions.some(
      (interaction) =>
        interaction.startTime === entry.startTime &&
        interaction.latency === entry.duration
    );
    if (isDuplicate) {
      return;
    }
  }
  const existing = id
    ? longestInteractions.find((interaction) => interaction.id === id)
    : undefined;
  if (existing) {
    existing.latency = Math.max(existing.latency, entry.duration);
  } else {
    observedInteractions++;
    longestInteractions.push({
      id,
      latency: entry.duration,
      startTime: entry.startTime,
    });
  }
  longestInteractions.sort((a, b) => b.latency - a.latency);
  // Only the slowest interactions can ever become the reported value
  longestInteractions.length = Math.min(
    longestInteractions.length,
    MAX_INTERACTIONS
  );
};

export const initInteractionToNextPaint = (
  performanceEntries: PerformanceEventTiming[]
) => {
  performanceEntries.forEach(processInteractionEntry);
};

/**
 * Current INP candidate: the slowest interaction, minus one allowed outlier
 * per 50 interactions. Null until the user has interacted at all.
 */
export const getInteractionToNextPaint = (): number | null => {
  if (!longestInteractions.length) {
    return null;
  }
  const index = Math.min(
    longestInteractions.length - 1,
    Math.floor(getInteractionCount() / 50)
  );
  return longestInteractions[index].latency;
};

// Test seam: the module keeps page-level state
export const resetInteractions = () => {
  longestInteractions.length = 0;
  observedInteractions = 0;
};
