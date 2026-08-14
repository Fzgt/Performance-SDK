import { WN } from '../data/constants';
import {
  EffectiveConnectionType,
  IPerfNetworkInformation,
} from '../typings/types';

export let et: EffectiveConnectionType = '4g';
export let sd = false;

export const getNetworkInformation = (): IPerfNetworkInformation => {
  if ('connection' in WN) {
    const dataConnection = (WN as any).connection;
    if (typeof dataConnection !== 'object') {
      return {};
    }
    et = dataConnection.effectiveType;
    sd = !!dataConnection.saveData;
    return {
      downlink: dataConnection.downlink,
      effectiveType: dataConnection.effectiveType,
      rtt: dataConnection.rtt,
      saveData: !!dataConnection.saveData,
    };
  } else {
    // TODO: fall back to a Doppler-style or image-probe speed test
  }
  return {};
};
