import { IMetricMap, IPerfDataConsumption } from '../typings/types';

export const metrics: IMetricMap = {};
export const cls = {
  value: 0,
};
export const fcp = {
  value: 0,
};
export const lcp = {
  value: 0,
};
export const fcpEntryName = 'first-contentful-paint';
export const rt: { value: IPerfDataConsumption } = {
  value: {
    beacon: 0,
    css: 0,
    fetch: 0,
    img: 0,
    other: 0,
    script: 0,
    total: 0,
    xmlhttprequest: 0,
  },
};
// Total main-thread blocking time
export const tbt = {
  value: 0,
};
