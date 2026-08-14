import {
  getIsLowEndDevice,
  getIsLowEndExperience,
} from '../src/helpers/isLowEnd';

const setNavigatorField = (field: string, value: unknown) => {
  Object.defineProperty(window.navigator, field, {
    value,
    configurable: true,
  });
};

describe('getIsLowEndDevice', () => {
  afterEach(() => {
    setNavigatorField('hardwareConcurrency', undefined);
    setNavigatorField('deviceMemory', undefined);
  });

  it('flags devices with 4 or fewer logical cores as low-end', () => {
    setNavigatorField('hardwareConcurrency', 4);
    expect(getIsLowEndDevice()).toBe(true);
  });

  it('flags devices with 4GB or less RAM as low-end', () => {
    setNavigatorField('hardwareConcurrency', 8);
    setNavigatorField('deviceMemory', 4);
    expect(getIsLowEndDevice()).toBe(true);
  });

  it('does not flag capable devices as low-end', () => {
    setNavigatorField('hardwareConcurrency', 8);
    setNavigatorField('deviceMemory', 8);
    expect(getIsLowEndDevice()).toBe(false);
  });
});

describe('getIsLowEndExperience', () => {
  it('treats slow-2g/2g/3g connections as a low-end experience regardless of device', () => {
    expect(getIsLowEndExperience('slow-2g', false)).toBe(true);
    expect(getIsLowEndExperience('2g', false)).toBe(true);
    expect(getIsLowEndExperience('3g', false)).toBe(true);
  });

  it('falls back to device/data-saver status on 4g', () => {
    expect(getIsLowEndExperience('4g', true)).toBe(true);
  });
});
