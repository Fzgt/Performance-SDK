import { IPerfData, IVitalsScore } from '../typings/types';

//https://web.dev/vitals/
const fcpScore = [1000, 2500];
const lcpScore = [2500, 4000];
const inpScore = [200, 500];
const clsScore = [0.1, 0.25];
const tbtScore = [300, 600];

export const webVitalsScore: Record<string, number[]> = {
  fp: fcpScore,
  fcp: fcpScore,
  lcp: lcpScore,
  lcpFinal: lcpScore,
  inp: inpScore,
  inpFinal: inpScore,
  cls: clsScore,
  clsFinal: clsScore,
  tbt: tbtScore,
  tbt5S: tbtScore,
  tbt10S: tbtScore,
  tbtFinal: tbtScore,
};

export const getVitalsScore = (
  measureName: string,
  value: IPerfData
): IVitalsScore => {
  if (!webVitalsScore[measureName]) {
    return null;
  }
  // Only the numeric metrics have thresholds; navigation timing and network
  // information payloads are scored as null.
  if (typeof value !== 'number') {
    return null;
  }
  if (value <= webVitalsScore[measureName][0]) {
    return 'good';
  }
  return value <= webVitalsScore[measureName][1] ? 'needsImprovement' : 'poor';
};
