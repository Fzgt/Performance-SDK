import ReportData from '../data/ReportData';
import { IPerfConfig, IReportData } from '../typings/types';

export const config: IPerfConfig = {
  // Metrics
  reportData: new ReportData({ logUrl: 'hole' }),
  isResourceTiming: false,
  isElementTiming: false,
  // Logging
  maxTime: 15000,
};
