import { describe, it, expect } from 'vitest';
import formatDate from '../../utils/FormatDate';

describe('utils/FormatDate', () => {
  it('formats a valid ISO date string', () => {
    expect(formatDate('2024-01-15')).toBe('15/01/2024');
  });

  it('formats a datetime string', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('15/01/2024');
  });

  it('returns Invalid Date for invalid string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });

  it('returns Invalid Date for empty string', () => {
    expect(formatDate('')).toBe('Invalid Date');
  });
});
