import { describe, it, expect } from 'vitest';
import FormatCurrency from '../../utils/FormatCurrency';

describe('utils/FormatCurrency', () => {
  it('formats a positive number', () => {
    expect(FormatCurrency(1234.5)).toBe('1\u202f234,50\u00a0DZD');
  });

  it('formats a numeric string', () => {
    expect(FormatCurrency('1234.5')).toBe('1\u202f234,50\u00a0DZD');
  });

  it('formats zero', () => {
    expect(FormatCurrency(0)).toBe('0,00\u00a0DZD');
  });

  it('formats a negative number', () => {
    expect(FormatCurrency(-100)).toBe('-100,00\u00a0DZD');
  });

  it('returns NaN formatting for invalid input', () => {
    expect(FormatCurrency('abc')).toBe('NaN\u00a0DZD');
  });
});
