import { describe, expect, it } from 'vitest';
import { telOf } from './useSite';

describe('telOf', () => {
  it('converts Nigerian local numbers to international format', () => {
    expect(telOf('09057315511')).toBe('+2349057315511');
    expect(telOf('0802 060 0641')).toBe('+2348020600641');
  });
  it('keeps numbers that are already international', () => {
    expect(telOf('+234 805 731 5511')).toBe('+2348057315511');
  });
});
