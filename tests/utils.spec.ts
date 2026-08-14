import { roundByTwo, convertToMB } from '../src/helpers/utils';

describe('roundByTwo', () => {
  it('rounds to two decimal places', () => {
    expect(roundByTwo(1.23456)).toBe(1.23);
    expect(roundByTwo(1.005)).toBe(1);
    expect(roundByTwo(10)).toBe(10);
  });
});

describe('convertToMB', () => {
  it('converts bytes to a rounded MB value', () => {
    expect(convertToMB(1024)).toBe(0);
    expect(convertToMB(1024 * 1024)).toBe(1);
  });

  it('returns null for non-number input', () => {
    // @ts-expect-error - intentionally passing an invalid type
    expect(convertToMB('1024')).toBeNull();
  });
});
