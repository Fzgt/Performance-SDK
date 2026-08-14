import { getVitalsScore } from '../src/helpers/vitalsScore';

describe('getVitalsScore', () => {
  it('returns null for an unknown metric name', () => {
    expect(getVitalsScore('notARealMetric', 100)).toBeNull();
  });

  it('scores FCP as good at or below the good threshold', () => {
    expect(getVitalsScore('fcp', 1000)).toBe('good');
    expect(getVitalsScore('fcp', 500)).toBe('good');
  });

  it('scores FCP as needsImprovement between the thresholds', () => {
    expect(getVitalsScore('fcp', 1500)).toBe('needsImprovement');
    expect(getVitalsScore('fcp', 2500)).toBe('needsImprovement');
  });

  it('scores FCP as poor above the poor threshold', () => {
    expect(getVitalsScore('fcp', 2501)).toBe('poor');
  });

  it('scores CLS using its own (sub-1) thresholds', () => {
    expect(getVitalsScore('cls', 0.05)).toBe('good');
    expect(getVitalsScore('cls', 0.2)).toBe('needsImprovement');
    expect(getVitalsScore('cls', 0.3)).toBe('poor');
  });

  it('scores aliased measure names (e.g. lcpFinal) the same as their base metric', () => {
    expect(getVitalsScore('lcpFinal', 2000)).toBe(getVitalsScore('lcp', 2000));
    expect(getVitalsScore('tbtFinal', 700)).toBe('poor');
  });
});
